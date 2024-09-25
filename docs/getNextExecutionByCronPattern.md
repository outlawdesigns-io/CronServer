**Get Next Execution By Cron Pattern**
----
  Returns json data about the next time an `Execution` object associated with a particular cron time pattern should be generated.

* **URL**

  `/next/pattern/:pattern`

* **Method:**

  `GET`

*  **URL Params**

   **Required:**

   `pattern=[string]`

   `pattern` should be sent as  url encoded string generated using `encodeURIComponent` or an equivalent method.

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200
    **Content:**
    ```
	  {
        "pattern": "*/2 * * * *",
        "next": "Wed Sep 25 2024 13:04:00 GMT-0500"
	  }
    ```

* **Error Response:**

  * **Code:** 200
    **Content:** `{ error : "Access Denied. No Token Present." }`

   OR

  * **Code:** 200
    **Content:** `{ error : "Access Denied. Invalid Token." }`

* **Sample Call:**

  ```javascript
    $.ajax({
      url: "/next/pattern/*%2F2%20*%20*%20*%20*",
      dataType: "json",
      type : "GET",
      success : function(r) {
        console.log(r);
      }
    });
  ```
