"""Contact Sales inquiries: submission, spam protection and the admin inbox."""

INQUIRY = {
    "name": "Test Customer",
    "email": "customer@example.com",
    "phone": "0917 000 0000",
    "subject": "8-Camera CCTV Kit",
    "message": "Please send a quotation.",
    "productSlug": "cctv-kit-8-camera",
}


def _new_count(admin) -> int:
    return admin.get("/api/admin/inquiries", params={"status": "new"}).json()["counts"]["new"]


def test_inquiry_is_saved_with_an_activity_entry(admin):
    before = _new_count(admin)
    assert admin.post("/api/inquiries", json={**INQUIRY, "name": "Saved Customer"}).status_code == 201
    assert _new_count(admin) == before + 1

    item = admin.get("/api/admin/inquiries", params={"q": "Saved Customer"}).json()["items"][0]
    detail = admin.get(f"/api/admin/inquiries/{item['id']}").json()
    assert detail["productSlug"] == "cctv-kit-8-camera"
    assert [e["text"] for e in detail["events"]] == ["Inquiry received from the website"]


def test_honeypot_submissions_are_silently_dropped(admin):
    before = admin.get("/api/admin/inquiries").json()["counts"]["all"]
    res = admin.post("/api/inquiries", json={**INQUIRY, "website": "http://spam.example"})
    assert res.status_code == 201  # looks like success to the bot
    assert admin.get("/api/admin/inquiries").json()["counts"]["all"] == before


def test_invalid_inquiries_are_rejected(client):
    assert client.post("/api/inquiries", json={**INQUIRY, "email": "not-an-email"}).status_code == 422
    assert client.post("/api/inquiries", json={**INQUIRY, "message": ""}).status_code == 422


def test_inquiries_are_rate_limited_per_visitor(client):
    statuses = [client.post("/api/inquiries", json=INQUIRY).status_code for _ in range(6)]
    assert statuses == [201] * 5 + [429]
    # Another visitor (different address) is not affected.
    other = client.post("/api/inquiries", json=INQUIRY, headers={"X-Forwarded-For": "203.0.113.9"})
    assert other.status_code == 201


def test_status_assignee_and_notes_are_logged(admin):
    admin.post("/api/inquiries", json={**INQUIRY, "name": "Logged Customer"})
    item = admin.get("/api/admin/inquiries", params={"q": "Logged Customer"}).json()["items"][0]

    updated = admin.patch(
        f"/api/admin/inquiries/{item['id']}",
        json={"status": "quoted", "assignee": "Pedro", "notes": "Sent quotation by email."},
    ).json()
    assert updated["status"] == "quoted"
    assert updated["assignee"] == "Pedro"
    events = [e["text"] for e in updated["events"]]
    assert len(events) == 4
    assert any(text.startswith("Status changed to Quoted") for text in events)
    assert any(text.startswith("Assigned to Pedro") for text in events)

    closed = admin.get("/api/admin/inquiries", params={"status": "quoted", "q": "Logged Customer"}).json()
    assert [i["id"] for i in closed["items"]] == [item["id"]]


def test_unknown_status_is_rejected(admin):
    admin.post("/api/inquiries", json={**INQUIRY, "name": "Status Customer"})
    item = admin.get("/api/admin/inquiries", params={"q": "Status Customer"}).json()["items"][0]
    assert admin.patch(f"/api/admin/inquiries/{item['id']}", json={"status": "maybe"}).status_code == 422
