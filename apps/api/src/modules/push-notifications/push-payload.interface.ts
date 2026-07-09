export interface PushPayload {
  title: string;                    // Localized notification title (used in OS banner)
  body: string;                     // Localized notification body (used in OS banner)
  type: string;                     // NotificationType enum value — mobile app uses for deep-linking
  data?: Record<string, string>;    // Extra metadata (entityId, courseId, etc.)
}
