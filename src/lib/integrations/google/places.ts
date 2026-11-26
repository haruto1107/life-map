
export type GooglePlaceCandidate = {
  placeId: string;
  name: string;
  address: string;
  googleMapsUrl: string | null;
};

export async function searchGooglePlaces(
  query: string,
  apiKey: string
): Promise<GooglePlaceCandidate[]> {
  if (!apiKey) {
    throw new Error("Google Maps API key is missing.");
  }

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": [
          "places.id",
          "places.displayName",
          "places.formattedAddress",
          "places.googleMapsUri",
        ].join(","),
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: "ja",
        regionCode: "JP",
        pageSize: 10,
      }),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Google Places API error: ${response.status}`
    );
  }

  const data = await response.json();

  return (data.places ?? []).map((place: any) => ({
    placeId: place.id,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
    googleMapsUrl: place.googleMapsUri ?? null,
  }));
}
