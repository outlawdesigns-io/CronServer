**Update Execution**
----
Update the properties of an existing `Execution` object.

* **URL**

  `/execution/:id`

* **Method:**

  `PUT`

*  **URL Params**

   **Required:**

   `id=[integer]`

* **Data Params**

  ```
  {
      "startTime": "2024-05-28 03:05:01",
  }
  ```

* **Success Response:**

  * **Code:** 200
    **Content:**
    ```
	  {
        "id": 2944,
        "jobId": 1,
        "startTime": "2024-05-28 03:05:01",
        "endTime": "2024-05-28 03:15:27",
        "output": "62333952+0 records in\n62333952+0 records out\n31914983424 bytes (32 GB, 30 GiB) copied, 924.371 s, 34.5 MB/s\n\nreal\t15m25.771s\nuser\t1m54.683s\nsys\t12m5.892s\n"

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
      url: "/execution/2944",
      dataType: "json",
      type : "PUT",
      success : function(r) {
        console.log(r);
      }
    });
  ```
