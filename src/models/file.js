import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
      trim: true,
    },
    publicId: {
      type: String, // From Cloudinary, useful for deleting/updating the image
    }
  },
  {
    // This option automatically adds createdAt and updatedAt fields
    timestamps: true,
  }
);

export default mongoose.model("File", fileSchema);