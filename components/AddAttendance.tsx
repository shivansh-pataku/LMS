import { useState, useEffect } from 'react';
import styles from './AddAttendance.module.css';
import axios from 'axios';

interface AttendanceRecord {
  roll_no: string;
  course_code: string;
  course_name: string;
}

interface AttendanceFormData {
  course_code: string;
  date: string;
  attendanceData: {
    [key: string]: 'P' | 'A';  // roll_no: status
  };
}

const AddAttendance = () => {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [courses, setCourses] = useState<{code: string, name: string}[]>([]);
  const [rollNumbers, setRollNumbers] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [formData, setFormData] = useState<AttendanceFormData>({
    course_code: '',
    date: new Date().toISOString().split('T')[0],
    attendanceData: {}
  });


  
///////////////////////////////// getting courses list ////////////////////////////////
useEffect(() => {
  const fetchCourses = async () => {
    try {
      console.log('Fetching courses...');
      const response = await axios.get('/api/courses/Attendance/get-teacher-courses');
      console.log('API Response:', response);
      
      if (Array.isArray(response.data)) {
        console.log('Setting courses:', response.data);
        setCourses(response.data);
        console.log('API Response:', courses);
      } else {
        console.warn('Invalid response format:', response.data);
        setCourses([]);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  fetchCourses();
}, []);






///////////////////////////////// getting list of rolls ////////////////////////////////
useEffect(() => {
  if (!selectedCourse) return;

  const fetchRollNumbers = async () => {
    try {
      const response = await axios.get(`/api/courses/Attendance/get-rolls?course=${selectedCourse}`);
      const rolls = response.data;
      const rollArray: string[] = Array.isArray(rolls) ? rolls : [];
      setRollNumbers(rollArray);
      setFormData(prev => ({
        ...prev,
        course_code: selectedCourse,
        attendanceData: Object.fromEntries(rollArray.map(roll => [roll, 'P']))
      }));
    } catch (error) {
      console.error('Failed to fetch roll numbers:', error);
    }
  };

  fetchRollNumbers();
}, [selectedCourse]);


///////////////////////////////// attandance change ////////////////////////////////
  const handleAttendanceChange = (roll_no: string, status: 'P' | 'A') => {
    setFormData(prev => ({
      ...prev, //
      attendanceData: {
        ...prev.attendanceData,
        [roll_no]: status
      }
    }));
  };


///////////////////////////////// saving the attandance ////////////////////////////////

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await axios.post('/api/courses/Attendance/create', formData);
    if (response.status === 200) {
      alert('Attendance submitted successfully');
      setIsOpen(false);
    }
  } catch (error) {
    alert('Failed to submit attendance. Please try again.');
    console.error('Submission error:', error);
  }
};


///////////////////////////////// saving the attandance ////////////////////////////////


  return (
    <div>


      <button 
        onClick={() => setIsOpen(true)}
        className={styles.button30}
      >
        Take Attendance
      </button>



{isOpen && (
          <div className={styles.formDibox}>
            {/* <h2 className="two">Take Attendance</h2> */}
            
            <form onSubmit={handleSubmit} >

                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)} // when
                    className={styles.ib}
                    required
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.code} value={course.code}>
                        {course.code} - {course.name}
                      </option>
                    ))}

                  </select>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} // ...prev : is used to 
                    className={styles.ib}
                    required
                  />


                  <button  type="button" onClick={() => setIsOpen(false)}className={styles.DiBUTTON}>Cancel</button>
                  <button type="submit" className={styles.DiBUTTON}> Submit </button>            



               <div className={styles.rolls}> 
                {rollNumbers.map(roll => (
                  <div key={roll} className={styles.roll}>
                    <span>{roll}</span>
                          <span><input type="radio" name={`attendance-${roll}`} checked={formData.attendanceData[roll] === 'P'} onChange={() => handleAttendanceChange(roll, 'P')} /> P</span>
                          <span><input type="radio" name={`attendance-${roll}`}checked={formData.attendanceData[roll] === 'A'} onChange={() => handleAttendanceChange(roll, 'A')} /> A</span>
                    </div>

                ))}
                </div>

            </form>
        </div>
)}


    </div>
  );
};

export default AddAttendance;

function setIsLoading(arg0: boolean) {
    throw new Error('Function not implemented.'); //function is not implemented yet : means that these components of function 
}
function setError(arg0: null) {
    throw new Error('Function not implemented.');
}

