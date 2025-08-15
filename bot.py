
import sys
import discord
from discord.ext import commands, tasks
import asyncio
import json
import logging
from datetime import datetime, time
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv
load_dotenv()
# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
intents = discord.Intents.default()
# Only enable if you have privileged intents enabled in developer portal
intents.message_content = True
intents.members = True
bot = commands.Bot(command_prefix='!', intents=intents)

# Configuration - modify these values
CONFIGS = [{
    "name": "TEST",
    "schedule_time_hour": "09",  
    "schedule_time_min": "25",  
    "target_users": [
        1402626371192225873,
        1380595817546776728
        # 1107979324033871953, # Moeez
    ],
    "questions": [
       "Testinng fetching AT 9:25 ?"
    ],
    "results_channel_id": 1392785644085968896,  # Set this to your channel ID
    "timeout_minutes": 5,  # How long to wait for responses
    "guild_id": 1114153865781203086  # Set this to your server ID
},{
    "name": "DEV",
    "schedule_time_hour": "09",  
    "schedule_time_min": "25",
    "target_users": [
        1402626371192225873,
        1380595817546776728
        # 1107979324033871953, # Moeez
        # 1326845726281433099, # Ameer Hamza
        # 1264811509108834304, # Bilal
        # 1145682886012456960, # Saad
        # 1125349356661387336, # Shaban
        # 1230860291093303377, # Shanawar
        # 1115169893600473129, # Ali Hamza
        # 1194292820274577590, # Asad
        # 1384073031915409459, # Umer
        # 1231118937497014275, # Nisha
        # 895733430103461889, # Tahoor
        # 646288518204751872, # Waris
    ],
    "questions": [
        "Testinng fetching AT 9:25 ?"
    ],
    "results_channel_id": 1392785644085968896,  # Set this to your channel ID
    "timeout_minutes": 180,  # How long to wait for responses
    "guild_id": 1114153865781203086  # Set this to your server ID
}]

CONFIG = None

# Store user responses
user_responses: Dict[int, Dict[str, str]] = {}
active_sessions: Dict[int, bool] = {}

class QuestionSession:
    def __init__(self, user_id: int, questions: List[str]):
        self.user_id = user_id
        self.questions = questions
        self.responses = {}
        self.current_question = 0
        self.completed = False
        self.start_time = datetime.now()

@bot.event
async def on_ready():
    logger.info(f'{bot.user} has connected to Discord!')
    
    # Validate configuration
    if not CONFIG["target_users"]:
        logger.warning("No target users configured!")
    if not CONFIG["results_channel_id"]:
        logger.warning("No results channel configured!")
    if not CONFIG["guild_id"]:
        logger.warning("No guild ID configured!")
    
    # Start the scheduler
#    daily_task.start()
    
    # await daily_task()
    daily_task.start() 
    logger.info(f"Scheduler started for {CONFIG['schedule_time_hour']}:{CONFIG['schedule_time_min']} daily task")


# import asyncio
# @tasks.loop(minutes=5)
# async def daily_task():
#     """Main scheduled task that runs daily"""
#     now = datetime.now()
# #    if not (str(now.hour) == str(CONFIG["schedule_time_hour"]) and str(now.minute) == str(CONFIG["schedule_time_min"])):
# #        logger.info(f"Skipping task, current time {now.strftime('%H:%M')} does not match scheduled time {CONFIG['schedule_time_hour']}:{CONFIG['schedule_time_min']}")
# #        return
#     logger.info("Running daily scheduled task")
#     await post_results()
    
#     guild = bot.get_guild(CONFIG["guild_id"])
#     if not guild:
#         logger.error(f"Could not find guild with ID {CONFIG['guild_id']}")
#         return

#     # Send questions to all target users concurrently
#     tasks = []
#     for user_id in CONFIG["target_users"]:
#         async def process_user(user_id=user_id):  # Capture user_id default arg
#             try:
#                 user = await bot.fetch_user(user_id)
#                 if user:
#                     await start_question_session(user)
#                 else:
#                     logger.warning(f"Could not find user with ID {user_id}")
#             except Exception as e:
#                 logger.error(f"Error sending questions to user {user_id}: {e}")
        
#         tasks.append(process_user())

#     await asyncio.gather(*tasks)

#     # Wait for responses and then post results
#     # await asyncio.sleep(CONFIG["timeout_minutes"] * 60)  # Wait for timeout

from datetime import date

last_run_date = None  # Track last date the task ran

@tasks.loop(minutes=1)
async def daily_task():
    """Main scheduled task that runs daily at the configured time"""
    global last_run_date
    now = datetime.now()
    scheduled_hour = int(CONFIG["schedule_time_hour"])
    scheduled_min = int(CONFIG["schedule_time_min"])
    
    # Check if it's the scheduled time and we haven't run today yet
    if now.hour == scheduled_hour and now.minute == scheduled_min:
        if last_run_date == now.date():
            logger.info("Daily task already ran today, skipping.")
            return
        
        last_run_date = now.date()
        logger.info("Scheduled time reached, running daily task")
        
        # Post any previous results first
        await post_results()
        
        guild = bot.get_guild(CONFIG["guild_id"])
        if not guild:
            logger.error(f"Could not find guild with ID {CONFIG['guild_id']}")
            return

        # Send questions to all target users concurrently
        tasks_list = []
        for user_id in CONFIG["target_users"]:
            async def process_user(user_id=user_id):
                try:
                    user = await bot.fetch_user(user_id)
                    if user:
                        await start_question_session(user)
                    else:
                        logger.warning(f"Could not find user with ID {user_id}")
                except Exception as e:
                    logger.error(f"Error sending questions to user {user_id}: {e}")
            tasks_list.append(process_user())
        
        await asyncio.gather(*tasks_list)

        logger.info(f"Questions sent to {len(CONFIG['target_users'])} users")
        
    else:
        logger.info(f"Skipping task, current time {now.strftime('%H:%M')} does not match scheduled time {scheduled_hour}:{scheduled_min}")



async def start_question_session(user: discord.User):
    """Start a question session with a user"""
    if user.id in active_sessions:
        logger.info(f"User {user.id} already has an active session")
        return
    
    try:
        # Create DM channel
        dm_channel = await user.create_dm()
        
        # Initialize session
        active_sessions[user.id] = True
        user_responses[user.id] = {}
        
        # Send initial message
        embed = discord.Embed(
            title="Daily Check-in",
            description=f"Hi {user.mention}! Time for your daily questions.\n"
                       f"I'll ask you {len(CONFIG['questions'])} questions.\n"
                       f"Please respond to each one.",
            color=0x00ff00
        )
        await dm_channel.send(embed=embed)
        
        # Start asking questions
        await ask_next_question(user, 0)
        
    except discord.Forbidden:
        logger.error(f"Cannot send DM to user {user.id} - DMs may be disabled")
    except Exception as e:
        logger.error(f"Error starting session with user {user.id}: {e}")

async def ask_next_question(user: discord.User, question_index: int):
    """Ask the next question to a user"""
    if question_index >= len(CONFIG["questions"]):
        await complete_session(user)
        return
    
    try:
        dm_channel = await user.create_dm()
        question = CONFIG["questions"][question_index]
        
        embed = discord.Embed(
            title=f"Question {question_index + 1}/{len(CONFIG['questions'])}",
            description=question,
            color=0x0099ff
        )
        embed.set_footer(text=f"Timeout: {CONFIG['timeout_minutes']} minutes")
        
        await dm_channel.send(embed=embed)
        
        # Wait for response
        def check(message):
            return (message.author.id == user.id and 
                   isinstance(message.channel, discord.DMChannel))
        
        try:
            response = await bot.wait_for('message', check=check, 
                                        timeout=CONFIG["timeout_minutes"] * 60)
            
            # Store response
            user_responses[user.id][question] = response.content
            
            # Ask next question
            await ask_next_question(user, question_index + 1)
            
        except asyncio.TimeoutError:
            await dm_channel.send("⏰ Session timed out. Your responses so far have been saved.")
            await complete_session(user)
            
    except Exception as e:
        logger.error(f"Error asking question to user {user.id}: {e}")
        await complete_session(user)

async def complete_session(user: discord.User):
    """Complete a user's question session"""
    try:
        dm_channel = await user.create_dm()
        
        embed = discord.Embed(
            title="Session Complete",
            description="Thank you for your responses! 🎉",
            color=0x00ff00
        )
        await dm_channel.send(embed=embed)
        
        # Mark session as complete
        if user.id in active_sessions:
            del active_sessions[user.id]
            
        logger.info(f"Completed session for user {user.id}")
        await post_immediate_results(user.id)
    except Exception as e:
        logger.error(f"Error completing session for user {user.id}: {e}")

async def post_results(clear=True):
    """Post all collected responses to the results channel"""
    if not CONFIG["results_channel_id"]:
        logger.error("No results channel configured!")
        return
    
    try:
        channel = bot.get_channel(CONFIG["results_channel_id"])
        if not channel:
            logger.error(f"Could not find channel with ID {CONFIG['results_channel_id']}")
            return
        
        
        if user_responses:
            # Create summary embed
            embed = discord.Embed(
                title="📊 Daily Check-in Results",
                description=f"Results from {datetime.now().strftime('%B %d, %Y')}",
                color=0xff9900,
                timestamp=datetime.now()
            )
            # Add results for each user
            for user_id, responses in user_responses.items():
                try:
                    user = await bot.fetch_user(user_id)
                    user_name = user.display_name if user else f"User {user_id}"
                    
                    if responses:
                        response_text = ""
                        for question, answer in responses.items():
                            response_text += f"**{question}**\n{answer}\n\n"
                        
                        if len(response_text) > 1024:
                            response_text = response_text[:1021] + "..."
                        
                        embed.add_field(
                            name=f"👤 {user_name}",
                            value=response_text,
                            inline=False
                        )
                    else:
                        embed.add_field(
                            name=f"👤 {user_name}",
                            value="No responses received",
                            inline=False
                        )
                        
                except Exception as e:
                    logger.error(f"Error processing responses for user {user_id}: {e}")
        
            await channel.send(embed=embed)
        if clear:
            # Clear responses for next day
            user_responses.clear()
            active_sessions.clear()
        
        logger.info("Posted results to channel")
        
    except Exception as e:
        logger.error(f"Error posting results: {e}")
        
async def post_immediate_results(user_id):
    """Post all collected responses to the results channel"""
    if not CONFIG["results_channel_id"]:
        logger.error("No results channel configured!")
        return
    
    try:
        channel = bot.get_channel(CONFIG["results_channel_id"])
        if not channel:
            logger.error(f"Could not find channel with ID {CONFIG['results_channel_id']}")
            return
        
        # Create summary embed
        embed = discord.Embed(
            title="📊 Daily Check-in Results",
            description=f"Results from {datetime.now().strftime('%B %d, %Y')}",
            color=0xff9900,
            timestamp=datetime.now()
        )
        
        responses = user_responses.get(user_id, {})
        
        # Add results for each user
        try:
            user = await bot.fetch_user(user_id)
            user_name = user.display_name if user else f"User {user_id}"
            
            if responses:
                response_text = ""
                for question, answer in responses.items():
                    response_text += f"**{question}**\n{answer}\n\n"
                
                if len(response_text) > 1024:
                    response_text = response_text[:1021] + "..."
                
                embed.add_field(
                    name=f"👤 {user_name}",
                    value=response_text,
                    inline=False
                )
            else:
                embed.add_field(
                    name=f"👤 {user_name}",
                    value="No responses received",
                    inline=False
                )
                
        except Exception as e:
            logger.error(f"Error processing responses for user {user_id}: {e}")
        
        await channel.send(embed=embed)
        
        user_responses.pop(user_id, None)  # Remove user responses after posting
        active_sessions.pop(user_id, None)  # Remove active session if exists

    except Exception as e:
        logger.error(f"Error posting results: {e}")

# Admin commands
@bot.command(name='test_questions')
@commands.has_permissions(administrator=True)
async def test_questions(ctx):
    """Test the question system (Admin only)"""
    await start_question_session(ctx.author)
    await ctx.send("Started test question session in your DMs!")

@bot.command(name='send_now')
@commands.has_permissions(administrator=True)
async def send_now(ctx):
    """Send questions to all target users immediately (Admin only)"""
    if not CONFIG["target_users"]:
        await ctx.send("❌ No target users configured!")
        return
    
    # Send confirmation
    embed = discord.Embed(
        title="🚀 Sending Questions Now",
        description=f"Sending questions to {len(CONFIG['target_users'])} users...",
        color=0x00ff00
    )
    status_msg = await ctx.send(embed=embed)
    
    # Send questions to all target users
    success_count = 0
    failed_users = []
    
    for user_id in CONFIG["target_users"]:
        try:
            user = await bot.fetch_user(user_id)
            if user:
                await start_question_session(user)
                success_count += 1
            else:
                failed_users.append(f"User ID {user_id} (not found)")
        except Exception as e:
            failed_users.append(f"User ID {user_id} ({str(e)})")
    
    # Update status message
    result_embed = discord.Embed(
        title="📤 Questions Sent",
        color=0x00ff00 if not failed_users else 0xffaa00
    )
    result_embed.add_field(
        name="✅ Successful",
        value=f"{success_count} users",
        inline=True
    )
    if failed_users:
        failed_text = "\n".join(failed_users[:5])  # Show max 5 failures
        if len(failed_users) > 5:
            failed_text += f"\n... and {len(failed_users) - 5} more"
        result_embed.add_field(
            name="❌ Failed",
            value=failed_text,
            inline=True
        )
    
    result_embed.add_field(
        name="⏰ Timeout",
        value=f"{CONFIG['timeout_minutes']} minutes",
        inline=True
    )
    
    await status_msg.edit(embed=result_embed)
    
    # Schedule automatic results posting
    if success_count > 0:
        await ctx.send(f"⏳ Results will be posted automatically in {CONFIG['timeout_minutes']} minutes, or use `!force_results` to post now.")
        
        # Wait for timeout then post results
        await asyncio.sleep(CONFIG["timeout_minutes"] * 60)
        await post_results(clear=False)

@bot.command(name='ask_user')
@commands.has_permissions(administrator=True)
async def ask_user(ctx, user: discord.User):
    """Send questions to a specific user immediately (Admin only)"""
    try:
        await start_question_session(user)
        await ctx.send(f"✅ Started question session with {user.mention} in their DMs!")
    except Exception as e:
        await ctx.send(f"❌ Failed to start session with {user.mention}: {str(e)}")

@bot.command(name='ask_me')
async def ask_me(ctx):
    """Send questions to yourself immediately"""
    try:
        await start_question_session(ctx.author)
        await ctx.send("✅ Started question session in your DMs!")
    except Exception as e:
        await ctx.send(f"❌ Failed to start session: {str(e)}")

@bot.command(name='force_results')
@commands.has_permissions(administrator=True)
async def force_results(ctx):
    """Force post results now (Admin only)"""
    await post_results()
    await ctx.send("Results posted!")

@bot.command(name='bot_config')
@commands.has_permissions(administrator=True)
async def show_config(ctx):
    """Show current bot configuration (Admin only)"""
    embed = discord.Embed(title="Bot Configuration", color=0x0099ff)
    embed.add_field(name="Schedule Time", value=f'{CONFIG["schedule_time_hour"]}:{CONFIG["schedule_time_min"]}', inline=True)
    embed.add_field(name="Target Users", value=len(CONFIG["target_users"]), inline=True)
    embed.add_field(name="Questions", value=len(CONFIG["questions"]), inline=True)
    embed.add_field(name="Timeout", value=f"{CONFIG['timeout_minutes']} minutes", inline=True)
    embed.add_field(name="Results Channel", value=f"<#{CONFIG['results_channel_id']}>" if CONFIG["results_channel_id"] else "Not set", inline=True)
    
    await ctx.send(embed=embed)

@bot.command(name='add_user')
@commands.has_permissions(administrator=True)
async def add_user(ctx, user: discord.User):
    """Add a user to the target list (Admin only)"""
    if user.id not in CONFIG["target_users"]:
        CONFIG["target_users"].append(user.id)
        await ctx.send(f"Added {user.mention} to target users!")
    else:
        await ctx.send(f"{user.mention} is already in the target list!")

@bot.command(name='remove_user')
@commands.has_permissions(administrator=True)
async def remove_user(ctx, user: discord.User):
    """Remove a user from the target list (Admin only)"""
    if user.id in CONFIG["target_users"]:
        CONFIG["target_users"].remove(user.id)
        await ctx.send(f"Removed {user.mention} from target users!")
    else:
        await ctx.send(f"{user.mention} is not in the target list!")

@bot.command(name='set_channel')
@commands.has_permissions(administrator=True)
async def set_channel(ctx, channel: discord.TextChannel):
    """Set the results channel (Admin only)"""
    CONFIG["results_channel_id"] = channel.id
    await ctx.send(f"Set results channel to {channel.mention}!")
# Error handling
@bot.event
async def on_command_error(ctx, error):
    if isinstance(error, commands.MissingPermissions):
        await ctx.send("You don't have permission to use this command!")
    elif isinstance(error, commands.CommandNotFound):
        pass  # Ignore unknown commands
    else:
        logger.error(f"Command error: {error}")
        await ctx.send("An error occurred while processing the command.")

# Run the bot
if __name__ == "__main__":
    # Get bot token from environment variable
   
    TOKEN = 'PLACEHOLDER_TOKEN'
   



    config_no = sys.argv[1]  # first argument
    CONFIG = CONFIGS[int(config_no) - 1] if config_no.isdigit() and 0 < int(config_no) <= len(CONFIGS) else CONFIGS[0]
    
    if not TOKEN:
        print("Error: DISCORD_BOT_TOKEN environment variable not set!")
        print("Please set your bot token as an environment variable.")
        exit(1)
    
    # Configuration setup print
    logger.info(f"Using configuration: {CONFIG['name']}")
    try:
        bot.run(TOKEN)
    except Exception as e:
        logger.error(f"Failed to start bot: {e}")
