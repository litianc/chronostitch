import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getMessagesByTrip, getTripById } from "@/lib/db/queries";

export function registerGetTripMessages(server: McpServer, userId: string) {
  server.registerTool(
    "get_trip_messages",
    {
      description: "获取指定旅行的所有聊天记录（AI 和用户的对话）。",
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

      const messages = await getMessagesByTrip(tripId);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              { trip: { id: trip.id, destination: trip.destination }, messages },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
