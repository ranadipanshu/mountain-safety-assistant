from groq import Groq
from django.conf import settings
from weather.services import get_weather


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

    weather_context = ""
    locations = ['Manali', 'Leh', 'Rishikesh', 'Badrinath', 'Shimla', 'Kinnaur', 'Dehradun', 'Mussoorie']
    for loc in locations:
        if loc.lower() in user_message.lower():
            weather = get_weather(loc)
            weather_context = f"""
Current weather at {loc}:
Temperature: {weather['temp']}°C
Condition: {weather['condition']}
Rainfall 3 day: {weather['rainfall_3day']}mm"""
            break

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