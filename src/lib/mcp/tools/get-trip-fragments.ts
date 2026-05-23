import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getTripById, getFragmentsByTrip } from "@/lib/db/queries";

export function registerGetTripFragments(server: McpServer, userId: string) {
  server.registerTool(
    "get_trip_fragments",
    {
      description: "获取指定旅行已编排的时间轴片段（AI 缝合的旅途记忆）。",
      inputSchema: {
        tripId: z.number().int().positive().describe("旅行 ID"),
      },
    },
    async ({ tripId }) => {
      const trip = await getTripById(tripId);
      if (!trip || trip.userId !== userId) {
        return {
          isError: true,
          content: [{ type: "text", text: `行程 ${tripId} 未找到或无权限访问。` }],
        };
      }

      const fragments = await getFragmentsByTrip(tripId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                trip: { id: trip.id, destination: trip.destination },
                totalFragments: fragments.length,
                fragments,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
