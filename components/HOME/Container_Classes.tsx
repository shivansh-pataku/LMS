'use client';
import React, { useEffect, useState } from 'react';
import styles from './Container_Classes.module.css';

type Courses ={ //data type for the courses fetched from the API, defines what a single course object looks like.
  course_code: string;
    course_name: string;
    credit: number;
    department: string;
    course_category: string;
    description: string;
    teacher_name: string;
  };


type Props = {
  selectedItem: string;
};

export default function Container_Classes({ selectedItem }: Props) {


// allCourses is of type Courses
  const [allCourses, setAllCourses] = useState<Courses[]>([]); //allCourses is your state variable, which will be an array of Course objects or type objects i.e. an array of Course type, starting as an empty array whose interface is alredy created
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const [selectedItem, setSelectedItem] = useState<string>('All Courses'); // Define selectedItem state


  useEffect(() => {

    const fetchCourses = async () =>{ //Create a state variable that holds an array of Course type, starting as an empty array whose interface is alredy created
 

        try {
          setIsLoading(true);
          const response = await fetch('/api/home');//Fetch data from the API endpoint and set the state variable response with the response data
          const data = await response.json();//Convert the response to JSON and store in data
          setAllCourses(data.AllCourses);//Update the AllCourses state with the data from the API
        } catch (err) {
            setError('Failed to fetch courses');
            console.error('Error:', err);
        } finally {
            setIsLoading(false);
        }


    }

    fetchCourses(); //Call the function to fetch courses

    
  }, []); //Empty dependency array means this effect runs once when the component mounts

const filteredCourses = selectedItem === 'All Courses'
  ? allCourses
  : allCourses.filter((course) => course.department === selectedItem);

  // if (isLoading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!allCourses.length) return <div>No courses available</div>;

              
  return (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "left" }}>
              <h2 className={styles.selection}>{selectedItem}</h2><br />


            <div className={styles.Container_Classes}>
                {filteredCourses.map((course, index) => { //Map through the allCourses array and return a div for each course object in the array
    
            const imageName = course.course_code.replace(/\s+/g, '');
            return (

              <div key={index} className={styles.item}>
              
                          {/* ///////image//////////////////////////////////////////////// */}

                            <div className={styles.image}>
                              <img
                              src={`/${imageName}.jpg`} alt={`Image for ${course.course_name}`}

                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/default.jpg';
                              }}

                              
                              />
                            </div>
                          
                            {/* ///////data//////////////////////////////////////////////// */}


                            <div className={styles.descriptionBOX}>
                              <span className={styles.description} style={{ fontWeight: "400", fontSize:"17px", color:"black"}}> {course.teacher_name}</span> 
                              <span className={styles.description} style={{ fontWeight: "400", fontSize:"15px", color:"grey",  width:"155px",  marginLeft:"auto", textAlign:"right"}}>{course.course_code}</span>
                              <span className={styles.description} style={{ fontWeight: "700", fontSize:"22px", color:"black", height:"auto", marginTop:"", marginBottom:"1px"}}  >{course.course_name}</span>
                              <p    className={styles.description} style={{ fontWeight: "500", fontSize:"17px", color:"grey" , height:"auto", marginTop:"3px", paddingBottom:"1px"}}  >{course.description}</p> 
                              {/* <span><strong>Department:</strong> {course.department}</span><br />
                              <span><strong>Credits:</strong> {course.credit}</span><br />
                              <span><strong>Category:</strong> {course.course_category}</span> */}
                            </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );

  
}


// import React from 'react';
// import styles from './Container_Classes.module.css';

// export default function Container_Classes() {
//   return (
//       <div style={{display:"flex", flexDirection:"column", alignItems:"left"}}>
//       <h2 className={styles.selection}>Computer Science</h2><br/>

//       <div className={styles.Container_Classes}>
        
//         {[1,2,3,4,5,6,7,8,9,10,].map((num) => (

//           <div key={num} className={styles.item}>
//             <div className={styles.image}><img src={`image${num}.jpg`} alt={`Image ${num}`} /></div>
//             <div className={styles.text}>Description {num}</div>
//           </div>

//         ))}
//       </div>
//       </div>
//   )
// }
