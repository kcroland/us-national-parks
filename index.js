// This is the javascript file for index.html of "National Park Previewer".
// Allows the user to search for a national park by typing into
// a search bar or by selecting a state and park from dropdown menus.
// Fetches park information including the list of parks for a state
// and park specific information from my parks.php file.

(function() {
  "use strict";

  const URL_BASE = "parks.php";

  /**
   *  When loaded, the web page will initialize page behavior.
   */
  window.addEventListener("load", initialize);

  /**
   *  Add search behavior to the search buttons and adds selection
   *  behavior when selecting a state or park.
   */
  function initialize() {
    $("state").addEventListener("change", showSelectParks);
    $("parks").addEventListener("change", selectParkInfo);
    $("search").addEventListener("click", searchParkInfo);
    $("refresh").addEventListener("click", refreshSearch);
  }

  /**
   *  Fetches the list of national parks for the selected state from parks.php.
   *  Displays the park selection drop down with national parks for the selected
   *  state. Hides the search bar and text.
   */
  function showSelectParks() {
    let state = qs("select").value;
    qs("input").value = "";

    $("enter-text").classList.add("hidden");
    if (state !== "none") {
      $("parks").classList.remove("hidden");
      $("parks").value = "none";

      let url = URL_BASE + "?state=" + state;
      fetch(url, {mode : "cors"})
         .then(checkStatus)
         .then(populateStateParks)
         .catch(console.log);
    } else {
      $("parks").classList.add("hidden");
      $("enter-text").classList.remove("hidden");
      $("park-info").innerHTML = "";
    }
  }

  /**
   *  Fills the park selection drop down with the given
   *  list of national parks from a selected state. If the state has
   *  no national parks, a message is displayed to the user.
   *  @param {text} stateParks - Plain text list of national parks.
   */
  function populateStateParks(stateParks) {
    $("parks").innerHTML = "";
    $("park-info").innerHTML = "";
    addNoneOption();

    let parkList = stateParks.split("\n");
    if (parkList[0].length > 1) {
      for (let i = 0; i < parkList.length - 2; i++) {
        let park = document.createElement("option");
        park.innerText = parkList[i];
        park.value = parkList[i]; 
        $("parks").appendChild(park);     
      } 
    } else {
      alert("This state has no national parks!");
    }
  }

  /**
   *  Gets the selected park's information.
   */
  function selectParkInfo() {
    let park = $("parks").value;

    if (park !== "none") {
      getParkInfo(park);
    } else {
      $("park-info").innerHTML = "";
    }    
  }

  /**
   *  Gets the searched park's information.
   *  Hides the state dropdown menu and unhides the referesh button.
   */
  function searchParkInfo() {
    $("refresh").classList.remove("hidden");
    $("or-option").classList.add("hidden");
    $("state").classList.add("hidden");

    let park = qs("input").value;
    $("parks").value = "none";
    qs("select").value = "none";

    if (park !== "") {
      getParkInfo(park);
    } else {
      alert("Nothing typed in to search.");
    }    
  }

  /**
   *  Gets the JSON object for the given park from parks.php. Checks the response
   *  status and displays the park information, displays an error to the
   *  user otherwise. 
   *  @param {string} park - Park name.
   */
  function getParkInfo(park) {
      let url = URL_BASE + "?park=" + park;
      fetch(url)
         .then(checkStatus)
         .then(JSON.parse)
         .then(viewPark)
         .catch(displayError);
  }

  /**
   *  Displays the park image from the given JSON object as well
   *  the year it was established and its name. Changes the page's
   *  background to the park's image (blurred).
   *  @param {object} parkInfo - JSON object of park information
   */
  function viewPark(parkInfo) {
    let park = "";
    if ($("parks") !== "none") {
      park = $("parks").value;
    } else {
      park = qs("input").value;
    }
    
    let parkImg = parkInfo.image;
    $("background-img").style["background-image"] = "url(\"" + parkImg + "\")";

    let preview = document.createElement("img");
    preview.classList.add("preview-img");
    preview.src = parkImg;
    preview.alt = park + " National Park";

    $("park-info").innerHTML = "";
    $("park-info").appendChild(preview);

    addInfo(parkInfo);
  }

  /**
   *  Adds a sentence of the park name and year it was established
   *  using the given park information. Also adds the state to the
   *  sentence if the park was selected for and not searched.
   *  @param {object} parkInfo - JSON object of park information
   */
  function addInfo(parkInfo) {
    let year = parkInfo.year;
    let parkName = parkInfo.name;
    let info = document.createElement("div");
    info.classList.add("img-info");
    if (qs("input").value < 1) {
      let stateAbb = qs("select").value;
      info.innerText = parkName + " National Park of " + stateAbb +
                       " was established in the year " + year + ".";       
    } else {
      info.innerText = parkName + " National Park was established in " + year + ".";
    }

    $("park-info").appendChild(info);
  }

  /**
   *  Refreshes the search bar and selection drop downs back to how it
   *  was when the page first loaded. The background remains the same
   *  but any current park image displayed is removed.
   */
  function refreshSearch() {
    $("refresh").classList.add("hidden");
    $("or-option").classList.remove("hidden");
    $("state").classList.remove("hidden");

    qs("input").value = "";
    $("park-info").innerHTML = "";   
  }

  /**
   *  Adds the "Select park" option to park dropdown. 
   */
  function addNoneOption() {
    let none = document.createElement("option");
    none.innerText = "Select a park";
    none.value = "none";
    $("parks").appendChild(none);
  }

  /**
   *  Alerts the user of the error when attempting to get the 
   *  searched park's information.
   *  @param {text} message - error message from the fetch call
   */
  function displayError(message) {
    alert(message);
  }

  /* ------------------------------ Helper Functions  ------------------------------ */

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} id - element ID
   * @returns {object} DOM object associated with id.
   */
  function $(id) {
    return document.getElementById(id);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} query - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(query) {
    return document.querySelector(query);
  }

  /**
   * Helper function to return the response's result text if successful, otherwise
   * returns the rejected Promise result with an error status and corresponding text
   * @param {object} response - response to check for success/error
   * @returns {object} - valid result text if response was successful, otherwise rejected
   *                     Promise result
   */
  function checkStatus(response) {
     const OK = 200;
     const ERROR = 300;
     let responseText = response.text();
     if (response.status >= OK && response.status < ERROR || response.status === 0) {
       return responseText;
     } else {
       return responseText.then(Promise.reject.bind(Promise));
     }
   }

})();