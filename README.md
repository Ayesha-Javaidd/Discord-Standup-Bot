# Check-in Discord Bot

## Key Features

- **Scheduled Daily Messages:** Runs at a specific time every day (configurable)
- **Direct Message System:** Sends questions to specified users via DM
- **Question Flow:** Asks predefined questions one by one and waits for responses
- **Results Posting:** Collects all responses and posts them to a specified channel
- **Admin Commands:** Full control over configuration and testing

## Setup Instructions

### Install Dependencies

```bash
pip install discord.py
```

### Set Environment Variable

```bash
export DISCORD_BOT_TOKEN="your_bot_token_here"
```

### Configure the Bot

- Edit the `CONFIG` dictionary in the code
- Set `target_users` (list of user IDs)
- Set `results_channel_id` (channel where results are posted)
- Set `guild_id` (your server ID)
- Customize questions and `schedule_time`

## Bot Permissions

- Send Messages
- Send Messages in DMs
- Use Slash Commands
- Read Message History

## Admin Commands

- `!test_questions` - Test the question system
- `!force_results` - Manually post results
- `!bot_config` - Show current configuration
- `!add_user @user` - Add user to target list
- `!remove_user @user` - Remove user from target list
- `!set_channel #channel` - Set results channel
- `!set_time HH:MM` - Change schedule time

## How It Works

1. **Daily Trigger:** At the configured time, the bot sends DMs to all target users
2. **Question Session:** Each user gets asked questions one by one
3. **Response Collection:** Bot waits for responses (with timeout)
4. **Results Compilation:** After timeout period, posts all responses to the results channel
5. **Session Reset:** Clears data for the next day

---

The bot handles errors gracefully, includes proper logging, and provides a clean embed-based interface for both questions and results. Users can respond naturally, and the bot will guide them through the entire process.

## How to Get a Discord Bot Token

### Step 1: Go to Discord Developer Portal

- Visit [Discord Developer Portal](https://discord.com/developers/applications)
- Log in with your Discord account

### Step 2: Create a New Application

- Click the **New Application** button
- Give your application a name (e.g., "Daily Scheduler Bot")
- Click **Create**

### Step 3: Configure Your Application

- You'll see your application dashboard
- Optionally add a description and icon for your bot
- Note down the **Application ID** (you might need this later)

### Step 4: Create the Bot

- Go to the **Bot** section in the left sidebar
- Click **Add Bot** or **Create Bot**
- Confirm by clicking **Yes, do it!**

### Step 5: Get Your Bot Token

- In the Bot section, you'll see a **Token** area
- Click **Reset Token** (or **Copy** if it's your first time)
- Copy and save this token securely — you won't be able to see it again without resetting

> ⚠️ **Important:** Never share your bot token publicly or commit it to version control!

### Step 6: Configure Bot Settings

**Privileged Gateway Intents:** Enable these if needed:
- Message Content Intent (required for reading message content)
- Server Members Intent (if you need member info)

**Bot Permissions:** Note what permissions your bot needs

### Step 7: Invite Bot to Your Server

- Go to **OAuth2** → **URL Generator**
- Select scopes:
  - `bot`
  - `applications.commands` (if using slash commands)
- Select bot permissions:
  - Send Messages
  - Send Messages in DMs
  - Read Message History
  - Use Slash Commands (if needed)
  - Administrator (for admin commands)
- Copy the generated URL and open it in your browser
- Select your server and authorize the bot

### Step 8: Set Up Your Environment

**Option 1: Environment Variable (Recommended)**

```bash
# On Windows (Command Prompt)
set DISCORD_BOT_TOKEN=your_token_here

# On Windows (PowerShell)
$env:DISCORD_BOT_TOKEN="your_token_here"

# On Linux/Mac
export DISCORD_BOT_TOKEN="your_token_here"
```

**Option 2: Create a .env file**

```
DISCORD_BOT_TOKEN=your_token_here
```

Then modify the bot code to use `python-dotenv`:

```python
from dotenv import load_dotenv
load_dotenv()

TOKEN = os.getenv('DISCORD_BOT_TOKEN')
```

### Step 9: Get Required IDs

You'll also need these IDs for the bot configuration:

**Get User IDs:**
- Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
- Right-click on users → "Copy User ID"

**Get Channel ID:**
- Right-click on the channel → "Copy Channel ID"

**Get Server (Guild) ID:**
- Right-click on the server name → "Copy Server ID"

---

## Security Best Practices

- Never share your bot token
- Use environment variables instead of hardcoding tokens
- Regenerate tokens if they're compromised
- Use `.gitignore` to exclude token files from version control


# Install on User Server
```
https://discord.com/oauth2/authorize?client_id=1394951351984848907
```
```
https://discord.com/oauth2/authorize?client_id=1394951351984848907&permissions=277025458176&integration_type=0&scope=bot+applications.commands
```