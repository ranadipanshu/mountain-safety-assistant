import re
from groq import Groq
from django.conf import settings
from weather.services import get_weather

KNOWN_LOCATIONS = [
    'Manali', 'Leh', 'Rishikesh', 'Badrinath', 'Shimla', 'Kinnaur',
    'Dehradun', 'Mussoorie', 'Rohtang', 'Zoji La', 'Rudraprayag',
    'Uttarkashi', 'Kunzum', 'Baralacha La',
]


def _extract_locations_from_text(text):
    """Whole-word match only (regex word boundaries), so 'Leh' inside
    another word or 'Dehradun' matching an unrelated word can never
    fire — unlike a plain substring `in` check."""
    found = []
    for loc in KNOWN_LOCATIONS:
        pattern = r'\b' + re.escape(loc.lower()) + r'\b'
        if re.search(pattern, text.lower()):
            found.append(loc)
    return found


def get_agent_response(user_message, selected_route=None):
    client = Groq(api_key=settings.GROQ_API_KEY)

    context = """Tum ek mountain travel safety assistant ho.
Tumhara kaam hai travellers ko safe routes suggest karna.
Tum weather, landslide history aur terrain ke basis pe risk assess karte ho.
Hamesha Hindi/Hinglish mein jawab do. Short aur clear jawab do."""

    route_context = ""
    if selected_route:
        route_context = f"""
Selected route: {selected_route.get('name', '')}
Risk level: {selected_route.get('risk_level', '')}
Distance: {selected_route.get('distance_km', '')} km
Duration: {selected_route.get('duration_hrs', '')} hrs"""

    # Priority 1: actually selected route ka real source/destination.
    # Priority 2 (fallback): whole-word match on user message — kabhi
    # substring match nahi, isliye "dehradun" kisi aur word ke andar
    # aane se galat city trigger nahi hogi.
    locations_to_check = []
    if selected_route and selected_route.get('name'):
        locations_to_check = [
            part.strip() for part in re.split(r'→|->', selected_route['name']) if part.strip()
        ]
    if not locations_to_check:
        locations_to_check = _extract_locations_from_text(user_message)

    weather_blocks = []
    for loc in locations_to_check[:2]:  # source + destination at most
        weather = get_weather(loc)
        weather_blocks.append(f"""
Current weather at {loc}:
Temperature: {weather['temp']}°C
Condition: {weather['condition']}
Rainfall 3 day: {weather['rainfall_3day']}mm""")
    weather_context = "".join(weather_blocks)

    full_prompt = f"""{context}
{route_context}
{weather_context}

User ka sawaal: {user_message}"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "user", "content": full_prompt}
            ],
            max_tokens=500,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Sorry, abhi AI service available nahi hai. Error: {str(e)}"