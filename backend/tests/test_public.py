"""Public API used by the website."""


def test_health(client):
    assert client.get("/api/health").json() == {"status": "ok"}


def test_site_content_has_defaults(client):
    site = client.get("/api/content/site").json()
    assert site["companyName"].startswith("Audio 4 Design")
    assert site["brandColor"] == "#cf010d"


def test_admin_only_content_is_not_public(client):
    assert client.get("/api/content/notifications").status_code == 404
    assert client.get("/api/content/nope").status_code == 404


def test_categories_include_published_product_counts(client):
    categories = client.get("/api/categories").json()
    assert len(categories) == 6
    assert categories[0]["slug"] == "speakers"
    assert categories[0]["productCount"] == 5


def test_products_are_paginated(client):
    page2 = client.get("/api/products", params={"page": 2}).json()
    assert page2["total"] == 22
    assert page2["page"] == 2
    assert len(page2["items"]) == 9

    # An out-of-range page lands on the last page.
    last = client.get("/api/products", params={"page": 99}).json()
    assert last["page"] == last["pageCount"] == 3
    assert len(last["items"]) == 4


def test_products_filter_by_category(client):
    cctv = client.get("/api/products", params={"category": "cctv"}).json()
    assert cctv["total"] == 4
    assert {p["categorySlug"] for p in cctv["items"]} == {"cctv"}


def test_search_matches_every_word(client):
    results = client.get("/api/products", params={"q": "speaker cable"}).json()
    assert "speaker-cable-2x2-5" in [p["slug"] for p in results["items"]]
    assert client.get("/api/products", params={"q": "zzzz-no-match"}).json()["total"] == 0


def test_featured_products(client):
    featured = client.get("/api/products", params={"featured": "true", "pageSize": 24}).json()
    assert featured["total"] == 8
    assert all(p["featured"] for p in featured["items"])


def test_product_detail_has_related_items_and_no_price(client):
    product = client.get("/api/products/active-pa-speaker-15").json()
    assert product["categorySlug"] == "speakers"
    assert len(product["related"]) == 4
    assert not any("price" in key.lower() for key in product)


def test_unknown_product_is_404(client):
    assert client.get("/api/products/does-not-exist").status_code == 404


def test_services(client):
    services = client.get("/api/services").json()
    assert len(services) == 6
    assert services[0]["includes"]
