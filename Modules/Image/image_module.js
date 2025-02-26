const mysql = require("mysql2");

// MySQL Database Connection
const db = mysql.createConnection({
      host: "podma-bd-cp1.hostever.com",
      user: "seaprope_bright_future_soft",
      password: "bright_future_soft",
      database: "seaprope_images"
});



// Upload Image
const upload_image = async (req, res, next) => {
      try {
            const imageBuffer = req.file.buffer;

    // Extract the file extension from the mimetype (e.g., "image/png" -> "png")
    const mimeTypeParts = req.file.mimetype.split("/");
    if (mimeTypeParts[0] !== "image") {
      return res.status(400).json({ message: "Uploaded file is not an image." });
    }
    const fileType = mimeTypeParts[1]; // e.g., "jpeg", "png", "gif"


            // Store image in MySQL
            const sql = "INSERT INTO images (image, fileType) VALUES (?, ?)";
            db.query(sql, [imageBuffer, fileType], (err, result) => {
                  if (err) {
                        return next(err);
                  }

                  // Construct Image URL
                  const fileUrl = `https://backend.seapropertiesltd.com.bd/api/v1/image/${result.insertId}.${fileType}`;
                  res.json({ imageUrl: fileUrl });
            });
      } catch (err) {
            next(err);
      }
};

// Get Image by ID
const get_image_by_id = (req, res, next) => {
      try {
            let imageId = req.params.id;
            imageId = imageId.replace(/\.[^/.]+$/, ""); // Remove file extension

            const sql = "SELECT image, fileType FROM images WHERE id = ?";
            db.query(sql, [imageId], (err, result) => {
                  if (err) {
                        return next(err);
                  }

                  if (result.length === 0) {
                        return res.status(404).json({ error: "Image not found" });
                  }

                  const fileType = result[0].fileType === "jpg" ? "image/jpeg" : "application/pdf";
                  res.contentType(fileType);
                  res.status(200).send(result[0].image);
            });
      } catch (err) {
            console.error("Error in GetImageByID:", err);
            res.status(500).json({ error: "Internal Server Error" });
      }
};

module.exports = { upload_image, get_image_by_id };
