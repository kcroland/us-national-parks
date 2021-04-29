<?php  
/*
 * parks.php web service that gets and outputs a list of national parks for a given
 * state from the United States. Also gets and outputs a JSON object of park information
 * if a given park is specified.
 *
 * Web service details:
 *   Required GET parameters:
 *     - state OR park
 *   examples
 *     - state=WA
 *     - park=Yosemite
 *   Output Format:
 *   - plain text or JSON
 *   Output Details:
 *     - If the state parameter is passed and is set to one of the 50 states' abbreviation,
 *       it will output a plain text list of national parks in that state
 *     - If the park parameter is passed and is set to any valid Unites States national park,
 *       it will output a JSON encoded object that contains an image for the park, the year 
 *       it was established, and the park name in capitalized first letter format
 *     - If the park parameter is passed with a park that it not a United States national park,
 *       then it will ourput an error message
 */

  error_reporting(E_ALL);

  /* 
   * Checks if the state query is set.
   * Gets the state's list of parks.
   */
  if (isset($_GET["state"])) {
    getParks();
  }

  /* 
   * Checks that the given state is in the States directory.
   * Outputs the list of parks as plain text. Outputs an empty
   * list if the state is not within the States directory
   * (it has no national parks).
   */
  function getParks() {
    $state = $_GET["state"];
    $path = "States/" . $state;
    $files = glob("States/*");

    header("Content-type: text/plain");
    if (in_array($path, $files)) {
      $park_list = file($path, FILE_IGNORE_NEW_LINES);
      echo implode($park_list, "\n");
    } else {
      echo "";
    }
  }

  /* 
   * Checks if the park query is set.
   * Gets the park's information.
   */
  if (isset($_GET["park"])) {
    get_park_json();
  }

  /* 
   * Checks that the given park is in the Parks directory.
   * Outputs a JSON object of the parks information including
   * an image, name, and year established. Outputs an error
   * message if the park is not found within the parks directory.
   */
  function get_park_json() {
    $park = format_name($_GET["park"]);
    $path = "Parks/" . $park;
    $files = glob("Parks/*");

    if (in_array($path, $files)) {
      $lines = file($path, FILE_IGNORE_NEW_LINES);

      header("Content-type: application/json");
      $result = array("image" => $lines[0], "year" => $lines[1], "name" => $park);
      echo json_encode($result);       
    } else {
      header("HTTP/1.1 400 Invalid Request");
      header("Content-type: text/plain");
      echo "National Park not found.";
    }
  }

  /* 
   * Formats and returns the given park name to have uppercased
   * first letters of the word, lowercases the rest of the letters.
   * The words "of" and "the" are formatted to all lowercase.
   * @param {string} park_name - Park name
   * @return {string} Formated park name
   */
  function format_name($park_name) {
    $result = "";
    $words = explode(" ", $park_name);
    foreach ($words as $word) {
      if ($word != "of" && $word != "the") {
        $first_letter = substr($word, 0, 1);
        $other_letters = substr($word, 1, strlen($word) - 1);
        $result .= strtoupper($first_letter) . strtolower($other_letters) . " ";
      } else {
        $result .= strtolower($word) . " ";
      }
    }

    return substr($result, 0, strlen($result) - 1);
  }
?>


 