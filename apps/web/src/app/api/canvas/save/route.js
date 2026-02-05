import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { name, layout_data } = await request.json();

    if (!name || !layout_data) {
      return Response.json(
        { error: "Name and layout_data are required" },
        { status: 400 },
      );
    }

    // Check if canvas exists
    const existing = await sql`
      SELECT id FROM canvas_layouts WHERE name = ${name}
    `;

    let result;
    if (existing.length > 0) {
      // Update existing
      result = await sql`
        UPDATE canvas_layouts 
        SET layout_data = ${JSON.stringify(layout_data)}, 
            updated_at = CURRENT_TIMESTAMP
        WHERE name = ${name}
        RETURNING *
      `;
    } else {
      // Create new
      result = await sql`
        INSERT INTO canvas_layouts (name, layout_data)
        VALUES (${name}, ${JSON.stringify(layout_data)})
        RETURNING *
      `;
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error("Error saving canvas:", error);
    return Response.json({ error: "Failed to save canvas" }, { status: 500 });
  }
}
