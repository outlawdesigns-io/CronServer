**Get Job Average Execution Time**
----
  Returns json data about the average amount of time a given `Job` object takes to execute.

* **URL**

  `/job/:id/avg`

* **Method:**

  `GET`

*  **URL Params**

   **Required:**

   `id=[integer]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200
    **Content:**
    ```
	  { "avg_execution_seconds":  338.1691 }
    ```

* **Error Response:**

  * **Code:** 200
    **Content:** `{ error : "Invalid UID" }`

  OR

  * **Code:** 200
    **Content:** `{ error : "Access Denied. No Token Present." }`

   OR

  * **Code:** 200
    **Content:** `{ error : "Access Denied. Invalid Token." }`

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/job/1/avg",
      dataType: "json",
      type : "GET",
      success : function(r) {
        console.log(r);
      }
    });
  ```
