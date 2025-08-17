import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not set" },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const species = body.species ?? "Unknown plant";
  const potSize = body.potSize ?? "6in";
  const potMaterial = body.potMaterial ?? "plastic";
  const soilType = body.soilType ?? "well-draining";
  const lightLevel = body.lightLevel ?? "medium";
  const humidity = body.humidity ?? "medium";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful plant care assistant that replies in JSON.",
        },
          {
            role: "user",
            content: `Give care recommendations for a plant with the following details:\nSpecies: ${species}\nPot size: ${potSize}\nPot material: ${potMaterial}\nSoil type: ${soilType}\nLight level: ${lightLevel}\nHumidity: ${humidity}\nRespond with a JSON object containing water (amountMl, frequencyDays), fertilizer (type, frequencyDays), light (level), repot (schedule).`,
          },
      ],
      response_format: { type: "json_object" },
    });

    const result = completion.choices[0]?.message?.content;
    if (!result) throw new Error("No response from model");

    const data = JSON.parse(result);
    return NextResponse.json({ ...data, source: "openai" });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
