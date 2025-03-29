import { useState } from "react";
import styles from '../styles/DialogueBox.module.css';

const Scores = () => {
    // State for modal visibility
    const [isOpen, setIsOpen] = useState(false);

    // State for form data
    const [formData, setFormData] = useState({
        course_name: "",
        description: "",
        duration: "",
        instructor_id: "",
        profileImage: null as File | null
    });

    // Open the modal
    const openModal = () => setIsOpen(true);

    // Close the modal
    const closeModal = () => setIsOpen(false);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle form submission
    // const handleSubmit = async (e) => {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                console.log("Course added successfully");
                closeModal();
            } else {
                console.error("Failed to add course");
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };

    return (
        <div>
            {/* Button to open form */}
            <button className={styles.textButton}
                onClick={openModal}
            >
                Add New Course
            </button>

            {/* Modal (Form Popup) */}
            {isOpen && (
                <div className={styles.DiBOX}>
                    <div className="bg-white p-6 rounded-lg shadow-lg w-1/3">
                        <h2 className="text-lg font-semibold mb-4">Add Course</h2>

                        {/* Form Inside Modal */}
                        <form onSubmit={handleSubmit} className={styles.formDibox}>
                            <input
                                type="text"
                                name="course_name"
                                placeholder="Course Name"
                                value={formData.course_name}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="text"
                                name="sem"  // Make sure "sem" exists in formData state
                                placeholder="Semester"
                                value={formData.sem}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="text"
                                name="category"
                                placeholder="Category"
                                value={formData.category}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="text"
                                name="credits"
                                placeholder="Credits"
                                value={formData.credits}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="date"
                                name="start_date" // Removed space
                                placeholder="Start Date"
                                value={formData.start_date}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                type="date"
                                name="end_date" // Removed space
                                placeholder="End Date"
                                value={formData.end_date}
                                onChange={handleChange}
                                className={styles.ib}
                            />

                            <input
                                name="description"
                                placeholder="Description"
                                value={formData.description}
                                onChange={handleChange}
                                className={styles.ib}
                                style={{ width: "514px" }}
                            />

                            <div style={{ height: "40px", width: "250px" }}>
                                {/* className={styles.ib} */}<input
                                    type="file"
                                    accept="image/*"
                                    // onChange={handleImageChange}
                                    className="ib"
                                    id="profile-image"
                                    style={{ display: 'none' }}
                                />

                                <label
                                    htmlFor="profile-image"
                                    className={styles.ib}
                                    style={{
                                        display: 'flex',
                                        color: 'green',
                                        cursor: 'pointer'

                                    }}
                                >
                                    {formData.profileImage ? 'Image Selected ✓' : 'Upload Class Cover'}
                                </label>
                            </div>



                            <br />
                            {/* Buttons */}
                            <div className={styles.DiBUTTONdiv}>
                                <button className
                                    type="button"
                                    onClick={closeModal}
                                    className={styles.DiBUTTON}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={styles.DiBUTTON}
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scores;
