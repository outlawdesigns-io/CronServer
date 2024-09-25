**Build crontab By Host**
----
Returns a crontab file generated for the given host.

> Note: This process considers only the job's `hostname` property and gives no consideration to its `user`.

* **URL**

  `/build/:targetHost/:isImg`

* **Method:**

  `GET`

*  **URL Params**

   **Required:**

   `targetHost=[string]`
   `isImg=[bit]`

* **Data Params**

  None

* **Success Response:**

  * **Code:** 200
    **Content:**
    ```
    ################################################################################################################################
    # CHEAT SHEET
    # MIN HOUR DOM MON DOW CMD
    # Field Description Allowed Value
    # MIN Minute field 0 to 59
    # HOUR Hour field 0 to 23
    # DOM Day of Month 1-31
    # MON Month field 1-12
    # DOW Day Of Week 0-6
    # CMD Command Any command to be executed.
    ################################################################################################################################

    TZ=CST
    SHELL=/bin/bash
    PATH=/usr/local/bin
    0 3 * * 2 /opt/scripts/cronWrapper.sh 1 "(time /home/outlaw/backupSystem.sh)" "/tmp/backup"    
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
      url: "/build/mypc/0",
      dataType: "json",
      type : "GET",
      success : function(r) {
        console.log(r);
      }
    });
  ```
