import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Box, Typography, Button, Snackbar, Alert } from "@mui/material";
import "./App.css"; // Import the custom CSS file

const App = () => {
    const [image, setImage] = useState(null);
    const [images, setImages] = useState([]);
    const [imageName, setImageName] = useState('');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Fetch images from backend when the component mounts
    useEffect(() => {
        axios.get("http://localhost:4000/api/images")
            .then((response) => {
                setImages(response.data.images || []); // Adjust based on actual response format
            })
            .catch((error) => {
                console.error("Error fetching images:", error);
                setSnackbarMessage("Failed to fetch images.");
                setOpenSnackbar(true);
            });
    }, []);

    // Handle image selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            setImage(reader.result);
        };
        
        if (file) {
            reader.readAsDataURL(file); // Convert the image to base64 format
            setImageName(file.name);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(image.split(',')[1]);

        if (image && imageName) {
            axios.post("http://localhost:4000/api/upload", {
                name: imageName,
                base64: image.split(',')[1],
                // Remove the data URL scheme
            })
            .then((response) => {
                setSnackbarMessage("Image uploaded successfully!");
                setOpenSnackbar(true);
                setImages([...images, response.data.image]); // Adjust based on actual response format
                setImage(null); // Clear the selected image
            })
            .catch((error) => {
                console.error("Error uploading image:", error);
                setSnackbarMessage("Failed to upload image.");
                setOpenSnackbar(true);
            });
        } else {
            alert("Please select an image first.");
        }
    };

    // Handle delete request
    const handleDelete = (id) => {
        axios.delete(`http://localhost:4000/api/images/${id}`)
            .then((response) => {
                setSnackbarMessage("Image deleted successfully!");
                setOpenSnackbar(true);
                setImages(images.filter(img => img._id !== id)); // Remove the deleted image from the state
            })
            .catch((error) => {
                console.error("Error deleting image:", error);
                setSnackbarMessage("Failed to delete image.");
                setOpenSnackbar(true);
            });
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Box className="upload-box" sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Image Upload
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Button variant="contained" component="label">
                        Choose Image
                        <input type="file" hidden onChange={handleImageChange} />
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        sx={{ mt: 2 }}
                    >
                        Upload
                    </Button>
                </form>

                {/* Image Preview */}
                {image && (
                    <Box
                        sx={{
                            mt: 4,
                            mb: 4,
                            textAlign: 'center',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '8px',
                            display: 'inline-block'
                        }}
                    >
                        <img
                            src={image}
                            alt={imageName || "Selected image preview"} // Descriptive alt text
                            style={{
                                maxWidth: '100%',
                                height: 'auto',
                                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)',
                                borderRadius: '8px'
                            }}
                        />
                        <Typography variant="body2" sx={{ mt: 2 }}>
                            {imageName}
                        </Typography>
                    </Box>
                )}

                <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                    Uploaded Images
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                    {images.length > 0 ? (
                        images.map((img) => (
                            <Box
                                key={img._id}
                                className="upload-image"
                                sx={{ textAlign: 'center', maxWidth: 200 }}
                            >
                                <img
                                    src={`data:image/jpeg;base64,${img.base64}`}
                                    alt={`Uploaded image: ${img.name}`} // Descriptive alt text
                                    style={{ width: '100%', height: 'auto', boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)' }}
                                />
                                <Typography variant="body2" align="center">
                                    {img.name}
                                </Typography>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={() => handleDelete(img._id)}
                                    sx={{ mt: 2 }}
                                >
                                    Delete
                                </Button>
                            </Box>
                        ))
                    ) : (
                        <Typography>No images uploaded yet.</Typography>
                    )}
                </Box>
            </Box>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success">
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default App;
