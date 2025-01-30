import requests
import json

url = "https://api.coingecko.com/api/v3/coins/markets"
# url = "https://pro-api.coingecko.com/api/v3/simple/supported_vs_currencies"

headers = {
    "accept": "application/json",
    "x-cg-pro-api-key": "CG-z2B2wgh1MCPSecvWcrdV4hfZ\t"
}

params = {
    "vs_currency": "usd"
}

response = requests.get(url, headers=headers, params=params)

with open ("data.json", "w") as file:
    json.dump(response.json(), file, indent=4)

print("Data saved to data.json")