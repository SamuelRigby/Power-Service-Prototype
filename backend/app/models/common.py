from bson import ObjectId


def serialize_doc(doc: dict) -> dict:
    doc = dict(doc)
    doc["id"] = str(doc.pop("_id"))
    return doc


def to_object_id(id_str: str) -> ObjectId | None:
    if not ObjectId.is_valid(id_str):
        return None
    return ObjectId(id_str)
