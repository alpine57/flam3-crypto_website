#!/usr/bin/python3

from datetime import datetime
import uuid
import models

class BaseModel:
    def __init__(self, *args, **kwargs):
        """Initialize BaseModel instance."""
        if kwargs:
            self.__set_attributes(kwargs)
        else:
            self.id = str(uuid.uuid4())
            self.created_at = self.updated_at = datetime.now()
            models.storage.new(self)  # Add new instance to storage

    def __set_attributes(self, attributes):
        """Set instance attributes from dictionary."""
        if "__class__" in attributes:
            del attributes["__class__"]
        if "created_at" in attributes:
            attributes["created_at"] = datetime.strptime(
                attributes["created_at"], "%Y-%m-%dT%H:%M:%S.%f"
            )
        if "updated_at" in attributes:
            attributes["updated_at"] = datetime.strptime(
                attributes["updated_at"], "%Y-%m-%dT%H:%M:%S.%f"
            )
        self.__dict__.update(attributes)

    def save(self):
        """Update updated_at attribute with current datetime and save to file."""
        self.updated_at = datetime.now()
        models.storage.save()

    def to_dict(self):
        """Return a dictionary representation of the instance."""
        attributes = self.__dict__.copy()
        attributes["created_at"] = self.created_at.isoformat()
        attributes["updated_at"] = self.updated_at.isoformat()
        attributes["__class__"] = self.__class__.__name__
        return attributes

    def __str__(self):
        """Return a string representation of the instance."""
        return "[{}] ({}) {}".format(
            self.__class__.__name__, self.id, self.__dict__
        )
