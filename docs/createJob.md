**Create Job**
----
Create a new `Job` object

* **URL**

  `/job/`

* **Method:**

  `POST`

*  **URL Params**

    None

* **Data Params**
  **Required:**
  ```
  {
    "title": "System Backup",
    "hostname": "mypc",
    "cronTime": "0 3 * * 2",
    "cmdToExec": "(time /home/outlaw/backupSystem.sh)",
    "outfile": "/tmp/backup"
  }
  ```
  **Optional**
  ```
  {
    "description": "Perform dd backup of the system to NAS.",
    "user": "outlaw",
    "friendlyTime": "At 03:00 on Tuesday",
    "container": 0,
    "imgName": null,
    "shell": "/bin/bash",
    "pathVariable": "/usr/local/bin"
    "tz_code": "CST",
    "cronWrapperPath": "/home/outlaw/"
  }
  ```

* **Success Response:**

  * **Code:** 200
    **Content:**
    ```
	  {
        "id": 1,
        "title": "System Backup",
        "description": "Perform dd backup of the system to NAS.",
        "hostname": "mypc",
        "user": "outlaw",
        "cronTime": "0 3 * * 2",
        "friendlyTime": "At 03:00 on Tuesday",
        "cmdToExec": "(time /home/outlaw/backupSystem.sh)",
        "container": 0,
        "imgName": null,
        "shell": "/bin/bash",
        "pathVariable": "/usr/local/bin",
        "outfile": "/tmp/backup",
        "tz_code": "CST",
        "cronWrapperPath": "/home/outlaw/",
        "created_date": "2020-10-16 16:02:08",
        "nextRun": "Tue Oct 01 2024 03:00:00 GMT-0500",
        "lastRun": "Tue Sep 24 2024 03:00:00 GMT-0500"
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
      url: "/job/",
      dataType: "json",
      type : "POST",
      success : function(r) {
        console.log(r);
      }
    });
  ```
