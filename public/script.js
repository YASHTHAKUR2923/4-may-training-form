document.addEventListener("DOMContentLoaded", function () {
    const role = localStorage.getItem("role");
    const adminLink = document.querySelector("nav ul li a[href='admin.html']");

    if (role !== "admin") {
        adminLink.style.display = "none"; // Hide the Dashboard link for non-admins
    }
});

function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
    const role = localStorage.getItem("role"); // Get user role
    const deleteBtn = document.getElementById("deleteBtn"); // Select the delete button

    // Hide delete button if the user is not an admin
    if (role !== "admin" && deleteBtn) {
        deleteBtn.style.display = "none";
    }
});

// ...............................................................................................................................................

document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("trainingForm");
    const tableBody = document.getElementById("dataTable");
    const calendarInput = document.getElementById("calendar");
    const searchButton = document.getElementById("searchMonth");
    const exportButton = document.getElementById("exportMonth");

    if (form) {
        form.addEventListener("submit", async function (event) {
            event.preventDefault();

            let formData = {
                calendar: document.getElementById("calendar").value,
                trainerName: document.getElementById("trainerName").value,
                otherTrainer: document.getElementById("otherTrainer").value,
                trainingDate: document.getElementById("trainingDate").value,
                trainingTiming: document.getElementById("trainingTiming").value,
                trainingTimingEnd: document.getElementById("trainingTimingEnd").value,
                trainingHead: document.getElementById("trainingHead").value,
                otherTrainingHead: document.getElementById("otherTrainingHead").value,
                trainingTopic: document.getElementById("trainingTopic").value,
                otherTrainingTopic: document.getElementById("otherTrainingTopic").value,
                Location: document.getElementById("Location").value,
                referenceNo: document.getElementById("referenceNo").value,
                employeeCode: document.getElementById("employeeCode").value,
                dataEnterBy: document.getElementById("dataEnterBy").value  // Added this line

            };

            try {
                const response = await fetch("https://four-may-training-form.onrender.com/submit-form", {

                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    alert("Form submitted successfully!");

                    // Save the form submission to localStorage
                    let submissions = JSON.parse(localStorage.getItem("submissions")) || [];
                    submissions.push(formData);
                    localStorage.setItem("submissions", JSON.stringify(submissions));

                    form.reset();
                    fetchTableData(); // Reload table with only new data
                } else {
                    alert("Error submitting form.");
                }
            } catch (error) {
                console.error(error);
            }
        });
    }

    // ...............................................................................................................................................


    async function fetchTableData(filterMonth = null) {
        try {
            const role = localStorage.getItem("role");
            if (!role) {
                console.error("Role not found in localStorage");
                return;
            }
    
    
            const response = await fetch(`https://four-may-training-form.onrender.com/get-data?role=${role}`);

            const data = await response.json();

            tableBody.innerHTML = "";


            const filteredData = filterMonth
                ? data.filter(entry => entry.calendar.startsWith(filterMonth)) // Match selected month
                : data;

            filteredData.forEach((entry, index) => {
                let employeeCodesArray = entry.employeecode.trim().replace(/,$/, "").split(",");

                let employeeCodesCount = employeeCodesArray.length; // Get count

                let row = document.createElement("tr");

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.calendar}</td>
                    <td>${entry.trainername}</td>
                    <td>${entry.othertrainer}</td>
                    <td>${entry.trainingdate}</td>
                    <td>${entry.trainingtiming}</td>
                    <td>${entry.trainingtimingend}</td>
                    <td>${entry.traininghead}</td>
                    <td>${entry.othertraininghead}</td>
                    <td>${entry.trainingtopic}</td>
                    <td>${entry.othertrainingtopic}</td>
                    <td>${entry.location}</td>
                    <td>${entry.referenceno}</td>
                <td>${employeeCodesCount} Codes</td> <!-- Show count instead of listing codes -->
                    <td>${entry.dataenterby}</td>
               
                    ${role === "admin" ? `<td><button class="delete-btn" data-id="${entry.id}">Delete</button></td>` : ""}
                `;

                tableBody.appendChild(row);
            });

            document.querySelectorAll(".export-btn").forEach(button => {
                button.addEventListener("click", function () {
                    let index = this.getAttribute("data-index");
                    exportSingleRow(filteredData[index]);
                });
            });



            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", function () {
                    let id = this.getAttribute("data-id");
                    deleteRow(id);
                });
            });


        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    // ....................Delete function...................................................................................................


    function deleteRow(id) {
        if (confirm("Are you sure you want to delete this submission?")) {
          fetch(`https://four-may-training-form.onrender.com/delete-data/${id}`, {

                method: "DELETE",
            })
                .then(response => response.json())
                .then(data => {
                    alert("Row deleted successfully!");
                    fetchTableData(); // Refresh table
                })
                .catch(error => console.error("Error deleting row:", error));
        }
    }
    // ..................Export fucntion to excel.............................................................................................

    function exportMonthData() {
        const role = "manager"; // Change to dynamic if needed
        const month = calendarInput.value;
    
       fetch(`https://four-may-training-form.onrender.com/get-data?role=${role}`)

            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Received data:", data);
    
                if (!Array.isArray(data)) {
                    throw new Error("Expected array, but got: " + JSON.stringify(data));
                }
    
                const filteredData = data.filter(entry => entry.calendar.startsWith(month));
    
                if (filteredData.length === 0) {
                    alert("No data found for the selected month.");
                    return;
                }
    
                const formattedData = [];
    
                filteredData.forEach(entry => {
                    const employeeCodesArray = entry.employeecode.trim().replace(/,$/, "").split(",");
    
                    employeeCodesArray.forEach(code => {
                        formattedData.push({
                            calendar: entry.calendar,
                            trainerName: entry.trainername,
                            otherTrainer: entry.othertrainer,
                            trainingDate: entry.trainingdate,
                            trainingStartTime: entry.trainingtiming,
                            trainingEndTime: entry.trainingtimingend,
                            trainingHead: entry.traininghead,
                            otherTrainingHead: entry.othertraininghead,
                            trainingTopic: entry.trainingtopic,
                            otherTrainingTopic: entry.othertrainingtopic,
                            location: entry.location,
                            referenceNo: entry.referenceno,
                            employeeCode: code.trim(),
                            dataEnteredBy: entry.dataenterby
                        });
                    });
                });
    
                const worksheet = XLSX.utils.json_to_sheet(formattedData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Data");
    
                XLSX.writeFile(workbook, `Training_Data_${month}.xlsx`);
            })
            .catch(error => {
                console.error("Error exporting data:", error);
                alert("Export failed: " + error.message);
            });
    }
    

    searchButton.addEventListener("click", function () {
        if (!calendarInput.value) {
            alert("Please select a month first!");
            return;
        }
        fetchTableData(calendarInput.value);
    });

    exportButton.addEventListener("click", exportMonthData);


    fetchTableData(); // Load table on page load
});

// ..................REference No genetrate to Calender...............................................................................

document.getElementById("calendar").addEventListener("change", function () {
    let selectedMonth = this.value; // Format: YYYY-MM
    if (selectedMonth) {
        let monthNames = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        let year = selectedMonth.split("-")[0]; // Extract Year
        let monthIndex = parseInt(selectedMonth.split("-")[1], 10) - 1; // Convert to index (0-11)
        let monthName = monthNames[monthIndex]; // Get Month Name

        // Generate a random number (you can modify logic for sequence)
        let randomNum = Math.floor(1000 + Math.random() * 9000);

        // Set Reference No in format "Month1234"
        document.getElementById("referenceNo").value = `${monthName}${randomNum}`;
    }
});




// other trainer name input open 
function toggleOtherInput() {
    var trainerSelect = document.getElementById("trainerName");
    var otherInputDiv = document.getElementById("otherTrainerDiv");

    if (trainerSelect.value === "other") {
        otherInputDiv.style.display = "block";  // Show input field
    } else {
        otherInputDiv.style.display = "none";   // Hide input field
    }
}

// ........................Topics depend on the training head...............................................................................

const topics = {
    "Awareness": [
        "Awareness of Environment Management system",
        "Awareness Program on Quality Management System ISO -9001-2015",
        "ESIC & EPF Awareness",
        "H R Policy & Systems",
        "Human Rights"
    ],
    "Chemical Management System": [
        "Chemical Safety",
        "Policies & Procedure (Child Labour , Minimum Wages , Bribery , Freedom of Association etc)"
    ],
    "Compilance": [
        "BSCI Code of conduct",
        "Business Ethics",
        "Business social compliance initiative",
        "Code of conduct (SMETA Pillar 4)",
        "Disciplinary Process"
    ],
    "CT PAT": [
        "CTPAT Training"
    ],
    "Customer Compliance": [
        "Cultural framework and leadership model",
        "MI Core values"
    ],
    "ETP": [
        "ETP/STP"
    ],
    "Fire Safety": [
        "Fire safety",
        "Training on Fire safety"
    ],
    "Fire Safety Training": [
        "First Aid Training"
    ],
    "First Aid": [
        "First Aid Training"
    ],
    "Grievance": [
        "Grievance Policy",
        "Ungal Kural session(Grievance Management session)"
    ],
    "Hygiene": [
        "Personal hygiene and food contamination policy"
    ],
    "Production": [
        "Awareness about process related defects",
        "Kaizen & 5 S",
        "Material Handling"
    ],
    "QMS": [
        "Awareness Program on Quality Management System ISO -9001-2015",
        "SMETA COC [ETI]",
        "SMETA Pillar 4",
        "Social Performance Team",
        "WSI code of conduct"
    ],
    "Safety": [
        "Health & Safety and use of PPEs"
    ],
    "Salary & Wages": [
        "Wages and benefits"
    ],
    "Soft skills": [
        "Team Building and brainstorming session"
    ],
    "SOPs": [
        "SOP Awareness",
        "Awareness of SOP"
    ],
    "Waste Management": [
        "Hazardous and Non Hazardous waste (Proper handling, store and use of PPEs)"
    ]
};


// other input topic

function toggleOtherInput(selectId, inputId) {
    var select = document.getElementById(selectId);
    var input = document.getElementById(inputId);

    if (select.value === "Other") {
        input.style.display = "block";
        input.required = true;
    } else {
        input.style.display = "none";
        input.required = false;
    }
}

function updateTopics() {
    let headSelect = document.getElementById("trainingHead");
    let topicSelect = document.getElementById("trainingTopic");
    let selectedHead = headSelect.value;
    let otherHeadInput = document.getElementById("otherTrainingHead").value.trim();

    // Clear previous options
    topicSelect.innerHTML = '<option value="" disabled selected>Select Training Topic</option>';

    // If "Other" is selected, allow the user to enter a custom Training Head
    if (selectedHead === "Other" && otherHeadInput) {
        topics[otherHeadInput] = topics[otherHeadInput] || [];
        topics[otherHeadInput].forEach(topic => {
            let option = document.createElement("option");
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
        return;
    }

    // Add relevant topics if a predefined Training Head is selected
    if (topics[selectedHead]) {
        topics[selectedHead].forEach(topic => {
            let option = document.createElement("option");
            option.value = topic;
            option.textContent = topic;
            topicSelect.appendChild(option);
        });
    }

    // Add "Other" option in Training Topic dropdown
    let otherOption = document.createElement("option");
    otherOption.value = "Other";
    otherOption.textContent = "Other";
    topicSelect.appendChild(otherOption);
}




// other input lOcation
function toggleOtherLocation() {
    let locationSelect = document.getElementById("Location");
    let otherInput = document.getElementById("otherLocationInput");

    // Show input if "Other" is selected, otherwise hide it
    if (locationSelect.value === "Other") {
        otherInput.style.display = "block";
        otherInput.setAttribute("required", "true"); // Make input required when visible
    } else {
        otherInput.style.display = "none";
        otherInput.removeAttribute("required"); // Remove required if not visible
    }
}



// Logout functionality
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}






document.getElementById("searchLocation").addEventListener("click", function () {
    let selectedLocation = document.getElementById("LocationFilter").value.toLowerCase();
    let tableRows = document.querySelectorAll("#dataTable tr");

    tableRows.forEach(row => {
        let locationCell = row.cells[11]; // Assuming "Location" is the 12th column (index 11)
        if (locationCell) {
            let locationText = locationCell.textContent.toLowerCase();
            if (selectedLocation === "" || locationText.includes(selectedLocation)) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        }
    });
});










// function filterTrainer() {
//     let input = document.getElementById("searchTrainer").value.toLowerCase();
//     let table = document.getElementById("dataTable");
//     let rows = table.getElementsByTagName("tr");

//     for (let i = 0; i < rows.length; i++) {
//         let trainerCell = rows[i].getElementsByTagName("td")[2]; 
//         if (trainerCell) {
//             let trainerName = trainerCell.textContent || trainerCell.innerText;
//             rows[i].style.display = trainerName.toLowerCase().includes(input) ? "" : "none";
//         }
//     }
// }



// Logout functionality
function logout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    window.location.href = "login.html";
}

// Redirect if not logged in
if (localStorage.getItem("isLoggedIn") !== "true") {
    window.location.href = "login.html";
}

// Load queries on page load
window.onload = loadQueries;


