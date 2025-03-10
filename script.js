document.getElementById("uploadForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    const resultDiv = document.getElementById("result");

    // Reset previous results
    resultDiv.innerHTML = `<p style="color: #FFD700; font-size: 20px; text-align: center;">⏳ Analyzing... Please wait</p>`;
    resultDiv.style.display = "block";

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Failed to analyze the resume.");
        }

        const result = await response.json();

        // Style the missing skills list with better UI
        let missingSkillsHTML = result.missing_skills.length > 0 
            ? result.missing_skills.map(skill => 
                `<span style="
                    background: linear-gradient(135deg, #ff9a9e, #fad0c4); 
                    padding: 10px 15px; 
                    margin: 6px; 
                    border-radius: 15px;
                    text-transform: capitalize;
                    display: inline-block;
                    color: #333;
                    font-weight: bold;
                    font-size: 16px;
                    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
                ">${skill}</span>`
              ).join("") 
            : "<p style='color: #4CAF50; font-size: 18px;'>✅ No missing skills! You're a great match.</p>";

        // Display results with a modern, stylish theme
        resultDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #ff7e5f, #feb47b);
                padding: 25px;
                border-radius: 12px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                animation: fadeIn 0.5s ease-in-out;
                max-width: 650px;
                margin: 20px auto;
                text-align: center;
                color: white;
            ">
                <h2 style="font-size: 26px; margin-bottom: 15px;">📊 Resume Analysis Results</h2>
                <p style="font-size: 22px;">
                    <strong>Match Score:</strong> 
                    <span style="color: #FFD700; font-size: 26px;">${result.match_score.toFixed(2)}%</span>
                </p>
                <p style="font-size: 20px; margin-top: 15px;"><strong>Missing Skills:</strong></p>
                <div style="display: flex; flex-wrap: wrap; justify-content: center;">
                    ${missingSkillsHTML}
                </div>
            </div>
        `;

    } catch (error) {
        console.error("Error:", error);
        resultDiv.innerHTML = `<p style="color: red; font-size: 20px; text-align: center;">❌ Error processing resume. Please try again.</p>`;
    }
});
