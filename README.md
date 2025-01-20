# Wake 'n' Tip

This is a utility intended to be scheduled and executed by a scheduling tool (such as crontab) to tip your full allocation of $DEGEN tips to a particular user.

## Prerequisites

You must:

* Have Node 22 or higher installed
* Have $DEGEN locked (see [degen.tips](https://www.degen.tips/airdrop2/current/vault))
* Have [a Neynar API key](https://docs.neynar.com/docs/getting-started-with-neynar#get-neynar-api-key) with [a configured signer key](https://docs.neynar.com/docs/how-to-create-a-farcaster-bot#generating-a-signer)

## Installation

These steps describe how to install the application.

### Clone the Repo

You are advised to put this project in `/opt/wakentip`.

Either download the source of this repository and unzip it to a location or clone it (if you have `git` installed):

```
git clone https://github.com/jrh3k5/makentip
```

### Configuration

Within the location to which you've installed the source code, copy the `.env.sample` file:

```
cp .env.sample .env
```

Then fill out the properties as described in the file.

For example, if you wish to support the [Crystal Hearts](https://warpcast.com/crystalhearts) organization providing material support to resist Vladimir Putin's illegal invasion of Ukraine, you could use a configuration like this:

```
NEYNAR_API_KEY=<your API key>
NEYNAR_SIGNER_UUID=<your signer UUID>>
RECIPIENT_FID=465152
TIPPER_FID=<your account's FID>
CRON_SCHEDULE=0 0 * * *
```

### Adding as a Service

These steps describe how to set this up as a service on a Linux environment (such as a Raspberry Pi).

First, create a `wakentip.service` file describing how to execute your service:

```
sudo nano /etc/systemd/system/wakentip.service
```

Fill it out with:

```
[Unit]
Description=wakentip
After=network.target

[Service]
WorkingDirectory=/opt/wakentip
ExecStart=node index.js
Type=notify
Restart=always

[Install]
WantedBy=default.target
RequiredBy=network.target
```

If you installed this application in a place other than `/opt/wakentip`, make sure to modify the `WorkingDirectory` parameter to reflect the correct location.

You can then start the service using:

```
sudo systemctl start wakentip.service
```

You can make sure it's running by executing:

```
systemctl status wakentip.service
```

You can also have the service run on boot by executing:

```
sudo systemctl enable wakentip.service
```