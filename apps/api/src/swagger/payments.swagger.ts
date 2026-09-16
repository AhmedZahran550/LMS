import { applyDecorators } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiHeader } from "@nestjs/swagger";

export const PaymentsSwagger = {
  handleWebhook: () =>
    applyDecorators(
      ApiOperation({
        summary: "Kashier payment webhook callback",
        description: "Receives payment status notifications from Kashier gateway, validates HMAC signature, and activates course purchases or storage subscriptions.",
      }),
      ApiHeader({
        name: "x-kashier-signature",
        required: false,
        description: "HMAC-SHA256 signature calculated with Kashier webhook secret",
      }),
      ApiResponse({ status: 200, description: "Webhook processed successfully" }),
      ApiResponse({ status: 400, description: "Invalid signature or malformed payload" }),
    ),
};
