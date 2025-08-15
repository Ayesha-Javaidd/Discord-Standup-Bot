import os
import discord
from discord.ext import commands
from apscheduler.schedulers.asyncio import AsyncIOScheduler
import asyncio
import httpx
from dotenv import load_dotenv
import logging
from datetime import datetime, time
from typing import Dict, List, Optional
import api

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Bot configuration
intents = discord.Intents.default()
bot = commands.Bot(command_prefix='!', intents=intents)

API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:8000')
API_KEY = os.getenv('API_KEY', 'your-strong-api-key')

HEADERS = {"X-API-KEY": API_KEY}

scheduler = AsyncIOScheduler()

# Remove old CONFIG and in-memory state
# All config will be fetched from the backend API

# ... rest of the bot logic will be refactored to use API ...

@bot.event
async def on_ready():
    logger.info(f'{bot.user} has connected to Discord!')
    # Fetch all checkins from API
    checkins = await api.fetch_all_checkins()
    for checkin in checkins:
        schedule_time = checkin['schedule_time']
        checkin_id = checkin['id']
        # Parse schedule_time (HH:MM:SS or HH:MM)
        hour, minute = map(int, schedule_time.split(":")[:2])
        scheduler.add_job(run_checkin, 'cron', hour=hour, minute=minute, args=[checkin_id], id=f"checkin_{checkin_id}")
        logger.info(f"Scheduled checkin {checkin['name']} at {schedule_time}")
    scheduler.start()

async def run_checkin(checkin_id: int):
    logger.info(f"Running checkin {checkin_id}")
    checkin_data = await api.fetch_checkin_full(checkin_id)
    if not checkin_data:
        logger.error(f"Could not fetch checkin {checkin_id} data from API")
        return
    checkin = checkin_data['checkin']
    questions = checkin_data['questions']
    users = checkin_data['users']
    timeout_minutes = 30  # Could be made configurable per checkin
    results_channel_id = checkin['channel_id']
    responses = {}
    for user in users:
        try:
            discord_user = await bot.fetch_user(int(user['discord_id']))
            await api.upsert_user(discord_user)
            responses[user['id']] = {}
            dm_channel = await discord_user.create_dm()
            await dm_channel.send(embed=discord.Embed(
                title="Daily Check-in",
                description=f"Hi {discord_user.mention}! Time for your daily questions.",
                color=0x00ff00
            ))
            for idx, question in enumerate(questions):
                embed = discord.Embed(
                    title=f"Question {idx+1}/{len(questions)}",
                    description=question['question_text'],
                    color=0x0099ff
                )
                embed.set_footer(text=f"Timeout: {timeout_minutes} minutes")
                await dm_channel.send(embed=embed)
                def check(m):
                    return m.author.id == discord_user.id and isinstance(m.channel, discord.DMChannel)
                try:
                    msg = await bot.wait_for('message', check=check, timeout=timeout_minutes*60)
                    responses[user['id']][question['id']] = msg.content
                    # Post response to API
                    await api.post_response({
                        'checkin_id': checkin_id,
                        'user_id': user['id'],
                        'question_id': question['id'],
                        'response_text': msg.content
                    })
                except asyncio.TimeoutError:
                    await dm_channel.send("⏰ Session timed out. Your responses so far have been saved.")
                    break
        except Exception as e:
            logger.error(f"Error with user {user['discord_id']}: {e}")
    # Post summary to results channel
    try:
        channel = bot.get_channel(int(results_channel_id))
        if not channel:
            logger.error(f"Could not find channel with ID {results_channel_id}")
            return
        embed = discord.Embed(
            title="📊 Daily Check-in Results",
            description=f"Results from {datetime.now().strftime('%B %d, %Y')}",
            color=0xff9900,
            timestamp=datetime.now()
        )
        for user in users:
            user_obj = await bot.fetch_user(int(user['discord_id']))
            user_name = user_obj.display_name if user_obj else user['discord_id']
            user_responses = responses.get(user['id'], {})
            if user_responses:
                response_text = ""
                for q in questions:
                    answer = user_responses.get(q['id'], 'No response')
                    response_text += f"**{q['question_text']}**\n{answer}\n\n"
                if len(response_text) > 1024:
                    response_text = response_text[:1021] + "..."
                embed.add_field(name=f"👤 {user_name}", value=response_text, inline=False)
            else:
                embed.add_field(name=f"👤 {user_name}", value="No responses received", inline=False)
        await channel.send(embed=embed)
        logger.info(f"Posted results to channel {results_channel_id}")
    except Exception as e:
        logger.error(f"Error posting results: {e}")

# ... keep admin commands, error handling, and bot.run as needed ...
