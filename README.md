# SysAdmin Google Apps Scripts
API scripts for automating with Google Apps Script

## Why This?
This collection contains the scripts I have written to automate many of the repetitive tasks for my school.  Most of them revolve around managing users (students and teachers), devices (Mostly Chromebooks and Macs), and the network (Meraki).  Some are quality-of-life scripts such as keeping staff mailing groups up-to-date based on active users in the staff OU and others are more maintenance focused such as keeping the student devices in the correct Meraki Group Policy so they are filtered correctly or sending reminder emails to staff who haven't rebooted their Mac for 30 days or more.  

## Why Use Google Apps Script?
* I like writing (poor) javascript.
* There is lots of documentation available.
* It's included if you already use Google.
* You can schedule script runs for whenever works for you.
* Automated runs don't need a local machine.
* Robust logs for each run.
* Develop locally or in the online IDE.

## Repository Organization
The API folder contains all the API functions for each service and they are in their own files (e.g., merakiApiCalls.js holds all the calls to Meraki).  The input and return parameters should be documented for each function.

The functions folder has scripts that use the API calls for one or more services (e.g., googleDevicesToMeraki.js).  Each function has a small explanation at the top for what it does.  These contain all the logic around making the API calls, parsing the responses, and making changes with another API call.


## Services
These are the services used in the functions.  Not all of them are fully fleshed out (Flowroute, FreePBX, Umbrella at this time) but I have plans to add more.  You don't need to use all of these since most of the functions only call one or two different services.  I've tried to link to the API documentation for each when possible:
* [SnipeIT](https://snipe-it.readme.io/reference/api-overview) - Asset management
* Mosyle - Apple MDM (Their API documentation is available in the dashboard if you have the API turned on)
* [Google](https://developers.google.com/admin-sdk/directory/reference/rest) - Chromebook management and user directory
* [Meraki](https://developer.cisco.com/meraki/api-v1/) - Networking infrastructure
* [Cisco Umbrella](https://developer.cisco.com/docs/cloud-security/) - Endpoint security and filtering
* [Flowroute](https://developer.flowroute.com/api/) - SIP trunking (VOIP)
* [Sal](https://github.com/salopensource/sal/wiki/API) - macOS, ChromeOS, Windows, and Linux endpoint reporting
* [FreePBX](https://wiki.freepbx.org/display/FPG/API) - GUI for Asterisk (VOIP)

## Setup
#### Clasp
[Google Clasp repo](https://github.com/google/clasp)
[Getting Started with Clasp](https://developers.google.com/apps-script/guides/clasp)

Clone the repo locally and push it with Clasp to a new Google Apps Script.  

Edit the setup.js file with your organization's information.  Each service has its own URLs and API keys, etc. so make sure you have all of them filled out for every service you use.

#### Manually
If you do not want to use Clasp you can copy-paste the files/functions you want by hand.

## Contributions
Opening new issues and Pull requests are welcome.  Areas that need growth:

* New API calls
* New functions
* Better/more clear documentation
* Error or bug fixing in the existing code

