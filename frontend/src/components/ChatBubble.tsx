import { View, Text, StyleSheet } from "react-native";
import { Message } from "@/store/chatStore";

// Theme colors
const colors = {
  primary600: "#4F46E5",
  dark100: "#F1F5F9",
  dark500: "#64748B",
  dark600: "#475569",
  dark700: "#334155",
  white: "#FFFFFF",
};

interface ChatBubbleProps {
  message: Message;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === "user";

  return (
    <View style={[styles.container, isUser ? styles.alignEnd : styles.alignStart]}>
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {/* Show attached documents */}
        {message.attachedDocuments && message.attachedDocuments.length > 0 && (
          <View style={styles.attachmentsContainer}>
            {message.attachedDocuments.map((doc, index) => (
              <View key={doc.file_id || index} style={styles.attachmentChip}>
                <Text style={styles.attachmentText}>
                  📎 {doc.filename}
                </Text>
                <Text style={styles.attachmentMeta}>
                  {(doc.file_size / 1024).toFixed(1)} KB • {doc.word_count} words
                </Text>
              </View>
            ))}
          </View>
        )}
        
        <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>

      {/* Sources (for assistant messages) */}
      {!isUser && message.sources && message.sources.length > 0 && (
        <View style={styles.sourcesContainer}>
          <Text style={styles.sourcesText}>📚 {message.sources.length} sources</Text>
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>
        {new Date(message.createdAt).toLocaleTimeString([], { 
          hour: "2-digit", 
          minute: "2-digit" 
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  alignEnd: {
    alignItems: "flex-end",
  },
  alignStart: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: colors.primary600,
    borderRadius: 16,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: colors.dark700,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    lineHeight: 24,
  },
  userText: {
    color: colors.white,
  },
  assistantText: {
    color: colors.dark100,
  },
  sourcesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 8,
  },
  sourcesText: {
    color: colors.dark500,
    fontSize: 12,
  },
  timestamp: {
    color: colors.dark600,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  attachmentsContainer: {
    marginBottom: 12,
    gap: 8,
  },
  attachmentChip: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 8,
  },
  attachmentText: {
    color: colors.white,
    fontSize: 13,
    marginBottom: 4,
  },
  attachmentMeta: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
  },
});
