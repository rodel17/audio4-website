"""Admin API: content, catalog and uploads."""

from app.config import MAX_UPLOAD_BYTES

from .conftest import png_upload


def test_dashboard(admin):
    data = admin.get("/api/admin/dashboard").json()
    assert data["stats"]["publishedProducts"] == 22
    assert data["stats"]["categories"] == 6
    labels = {item["label"]: item["done"] for item in data["checklist"]}
    assert labels["Replace placeholder contact details"] is False


def test_content_edits_show_on_the_public_api_immediately(admin):
    home = admin.get("/api/admin/content/home").json()
    original = home["hero"]["line1"]
    assert admin.get("/api/content/home").json()["hero"]["line1"] == original  # now cached

    home["hero"]["line1"] = "Clear Sound."
    assert admin.put("/api/admin/content/home", json=home).status_code == 200
    assert admin.get("/api/content/home").json()["hero"]["line1"] == "Clear Sound."

    home["hero"]["line1"] = original
    admin.put("/api/admin/content/home", json=home)


def test_home_sections_always_include_every_section_once(admin):
    home = admin.get("/api/admin/content/home").json()
    home["sections"] = [{"key": "cta", "visible": False}, {"key": "cta", "visible": True}]
    saved = admin.put("/api/admin/content/home", json=home).json()
    keys = [s["key"] for s in saved["sections"]]
    assert keys[0] == "cta" and saved["sections"][0]["visible"] is False
    assert sorted(keys) == sorted(["hero", "howToBuy", "categories", "featured", "services", "whyUs", "cta"])

    home["sections"] = [{"key": k, "visible": True} for k in ("hero", "howToBuy", "categories", "featured", "services", "whyUs", "cta")]
    admin.put("/api/admin/content/home", json=home)


def test_invalid_content_is_rejected(admin):
    assert admin.put("/api/admin/content/site", json={"brandColor": "red"}).status_code == 422
    assert admin.put("/api/admin/content/site", json={"nav": [{"label": "x", "href": "javascript:alert(1)"}]}).status_code == 422
    assert admin.put("/api/admin/content/unknown", json={}).status_code == 404


def test_notifications_are_editable_by_admins(admin):
    data = admin.get("/api/admin/content/notifications").json()
    data["recipients"] = ["sales@test.local"]
    assert admin.put("/api/admin/content/notifications", json=data).json()["recipients"] == ["sales@test.local"]


def test_category_and_product_lifecycle(admin):
    cat = admin.post("/api/admin/categories", json={"slug": "test-cat", "name": "Test Cat", "icon": "radio"})
    assert cat.status_code == 201
    cat_id = cat.json()["id"]
    assert admin.post("/api/admin/categories", json={"slug": "test-cat", "name": "Dup"}).status_code == 409

    body = {
        "slug": "test-product",
        "name": "Test Product",
        "categoryId": cat_id,
        "highlights": ["Loud", "  "],
        "specs": [{"label": "Power", "value": "100 W"}],
    }
    product = admin.post("/api/admin/products", json=body)
    assert product.status_code == 201
    product_id = product.json()["id"]
    assert product.json()["highlights"] == ["Loud"]  # blank lines are dropped
    assert admin.post("/api/admin/products", json={**body, "name": "Dup"}).status_code == 409

    # Published products appear publicly; drafts don't.
    assert admin.get("/api/products", params={"category": "test-cat"}).json()["total"] == 1
    admin.patch(f"/api/admin/products/{product_id}", json={"published": False})
    assert admin.get("/api/products", params={"category": "test-cat"}).json()["total"] == 0
    assert admin.get("/api/products/test-product").status_code == 404

    # A category with products can't be deleted.
    assert admin.delete(f"/api/admin/categories/{cat_id}").status_code == 409
    assert admin.delete(f"/api/admin/products/{product_id}").status_code == 204
    assert admin.delete(f"/api/admin/categories/{cat_id}").status_code == 204


def test_invalid_slug_is_rejected(admin):
    res = admin.post("/api/admin/categories", json={"slug": "Not A Slug!", "name": "x"})
    assert res.status_code == 422


def test_bulk_draft_and_publish(admin):
    ids = [p["id"] for p in admin.get("/api/admin/products", params={"pageSize": 2}).json()["items"]]
    assert admin.post("/api/admin/products/bulk", json={"ids": ids, "action": "draft"}).json() == {"updated": 2}
    assert admin.get("/api/products").json()["total"] == 20
    admin.post("/api/admin/products/bulk", json={"ids": ids, "action": "publish"})
    assert admin.get("/api/products").json()["total"] == 22


def test_reorder_categories(admin):
    cats = admin.get("/api/admin/categories").json()
    ids = [c["id"] for c in cats]
    admin.post("/api/admin/categories/reorder", json={"ids": list(reversed(ids))})
    assert [c["id"] for c in admin.get("/api/categories").json()] == list(reversed(ids))
    admin.post("/api/admin/categories/reorder", json={"ids": ids})


def test_image_upload_is_saved_and_served(admin):
    res = admin.post("/api/admin/uploads", files=png_upload())
    assert res.status_code == 201
    url = res.json()["url"]
    assert url.startswith("/uploads/") and url.endswith(".png")
    assert admin.get(url).content.startswith(b"\x89PNG")


def test_non_images_are_rejected(admin):
    files = {"file": ("x.png", b"<html><script>alert(1)</script></html>", "image/png")}
    assert admin.post("/api/admin/uploads", files=files).status_code == 415


def test_oversized_uploads_are_rejected(admin):
    assert admin.post("/api/admin/uploads", files=png_upload(MAX_UPLOAD_BYTES + 1)).status_code == 413
