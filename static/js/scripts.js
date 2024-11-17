document.addEventListener("DOMContentLoaded", function() {
    const totalMuseums = parseInt(document.querySelector(".container").getAttribute("data-total-museums"));
    let visitedCount = 0;

    // Elements
    const searchBar = document.getElementById("search-bar");
    const countryFilter = document.getElementById("country-filter");
    const resetLink = document.getElementById("reset-filters");
    const museumItems = document.querySelectorAll(".museum-item");
    const progressBar = document.getElementById("progress-bar");
    const progressBarContainer = document.getElementById("progress-bar-container");

    // Create and append progress text element
    const progressText = document.createElement("span");
    progressText.classList.add("progress-text");
    progressBarContainer.appendChild(progressText);

    // Retrieve visited museums from Local Storage
    const visitedMuseums = new Set(JSON.parse(localStorage.getItem("visitedMuseums")) || []);

    // Function to update progress bar and text
    function updateProgressBar() {
        const percentage = (visitedCount / totalMuseums) * 100;
        progressBar.style.width = `${percentage}%`;

        if (visitedCount > 0) {
            progressText.textContent = `${visitedCount} out of ${totalMuseums} museums visited`; // Dynamic text
        } else {
            progressText.textContent = ""; // No text when no museums are marked
        }
    }

    // Function to filter museums
    function filterMuseums() {
        const searchTerm = searchBar.value.toLowerCase();
        const selectedCountry = countryFilter.value;
        let anyVisible = false;

        museumItems.forEach(item => {
            const name = item.getAttribute("data-name");
            const country = item.getAttribute("data-country");

            const matchesName = name.includes(searchTerm);
            const matchesCountry = !selectedCountry || country === selectedCountry;

            if (matchesName && matchesCountry) {
                item.style.display = "flex";
                anyVisible = true;
            } else {
                item.style.display = "none";
            }
        });

        // Show or hide the no-results message
        const noResultsMessage = document.getElementById("no-results");
        noResultsMessage.style.display = anyVisible ? "none" : "block";

        // Show or hide the reset link
        resetLink.style.display = (searchTerm || selectedCountry) ? "inline" : "none";
    }

    // Mark museums as visited based on Local Storage
    museumItems.forEach(item => {
        const museumId = item.getAttribute("data-id");
        if (visitedMuseums.has(museumId)) {
            item.classList.add("visited");
            visitedCount++;
        }
    });

    // Update progress bar initially
    updateProgressBar();

    // Handle museum item click to toggle visited state
    museumItems.forEach(item => {
        item.addEventListener("click", function() {
            const museumId = item.getAttribute("data-id");
            if (item.classList.contains("visited")) {
                item.classList.remove("visited");
                visitedMuseums.delete(museumId);
                visitedCount--;
            } else {
                item.classList.add("visited");
                visitedMuseums.add(museumId);
                visitedCount++;
            }

            // Save visited museums to Local Storage
            localStorage.setItem("visitedMuseums", JSON.stringify([...visitedMuseums]));

            updateProgressBar();
        });
    });

    // Event Listener for Reset Link
    resetLink.addEventListener("click", function(event) {
        event.preventDefault();
        searchBar.value = "";
        countryFilter.value = "";
        filterMuseums();
    });

    // Event Listeners for Search and Filter
    searchBar.addEventListener("input", filterMuseums);
    countryFilter.addEventListener("change", filterMuseums);

    // Initial call to set the correct state of the reset link
    filterMuseums();
});
