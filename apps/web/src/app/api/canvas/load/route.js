import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "Default Canvas";

    const result = await sql`
      SELECT * FROM canvas_layouts 
      WHERE name = ${name}
      ORDER BY updated_at DESC
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({
        layout_data: { nodes: [], viewport: { x: 0, y: 0, zoom: 1 } },
      });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error loading canvas:", error);
    return Response.json({ error: "Failed to load canvas" }, { status: 500 });
  }
}
