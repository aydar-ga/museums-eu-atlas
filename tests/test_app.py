from app import app


def test_route_index():
    client = app.test_client()
    response = client.get("/")
    assert response.status_code == 200


def test_route_mark_visited():
    client = app.test_client()
    response = client.post("/mark-visited")
    assert response.status_code == 404  # Should return "Not Found" for now
