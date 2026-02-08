import { View, Text, TextInput, Pressable, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useRef, useEffect } from "react";
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from "@/hooks/useTranslation";
import { useChatStore, Message } from "@/store/chatStore";
import ChatBubble from "@/components/ChatBubble";
import TypingIndicator from "@/components/TypingIndicator";

// Theme colors
const colors = {
  primary600: "#4F46E5",
  primary700: "#4338CA",
  dark400: "#94A3B8",
  dark500: "#64748B",
  dark600: "#475569",
  dark700: "#334155",
  dark800: "#1E293B",
  dark900: "#0F172A",
  white: "#FFFFFF",
};

export default function ChatScreen() {
  const { t } = useTranslation();
  const { messages, sendMessage, isLoading, currentConversation } = useChatStore();
  const [inputText, setInputText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const handleSend = async () => {
    if ((!inputText.trim() && selectedFiles.length === 0) || isLoading) return;
    
    const text = inputText.trim() || "Analyze this document";
    setInputText("");
    const files = selectedFiles;
    setSelectedFiles([]);
    
    await sendMessage(text, files);
  };

  const handleFilePicker = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (result.canceled === false && result.assets) {
        // Check file sizes
        const validFiles: File[] = [];
        for (const asset of result.assets) {
          if (asset.size && asset.size > 10 * 1024 * 1024) {
            Alert.alert("File Too Large", `${asset.name} exceeds 10MB limit`);
            continue;
          }

          // For web, create File object
          if (Platform.OS === 'web' && asset.file) {
            validFiles.push(asset.file as File);
          } else {
            // For native, we need to handle differently
            // Create a blob from the URI
            const response = await fetch(asset.uri);
            const blob = await response.blob();
            const file = new File([blob], asset.name, { type: asset.mimeType || 'application/octet-stream' });
            validFiles.push(file);
          }
        }

        if (validFiles.length > 0) {
          setSelectedFiles(prev => [...prev, ...validFiles]);
        }
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert("Error", "Failed to pick document");
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("chat.title")}</Text>
        {currentConversation?.title && (
          <Text style={styles.headerSubtitle}>{currentConversation.title}</Text>
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
        keyboardVerticalOffset={0}
      >
        <View style={styles.messagesContainer}>
          {/* Messages List */}
          {messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Text style={styles.emptyEmoji}>⚖️</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {t("chat.noChats")}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t("chat.startChat")}
              </Text>
              <Text style={styles.emptyDisclaimer}>
                {t("legal.disclaimer")}
              </Text>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <ChatBubble message={item} />}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={isLoading ? <TypingIndicator /> : null}
            />
          )}
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <View style={styles.selectedFilesContainer}>
              {selectedFiles.map((file, index) => (
                <View key={index} style={styles.fileChip}>
                  <Text style={styles.fileChipText} numberOfLines={1}>
                    📎 {file.name}
                  </Text>
                  <Pressable onPress={() => removeFile(index)} style={styles.fileRemoveButton}>
                    <Text style={styles.fileRemoveText}>✕</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={styles.inputRow}>
            {/* File Upload Button */}
            <Pressable
              style={styles.attachButton}
              onPress={handleFilePicker}
              disabled={isLoading}
            >
              <Text style={styles.buttonEmoji}>📎</Text>
            </Pressable>

            {/* Text Input */}
            <View style={styles.textInputWrapper}>
              <TextInput
                style={styles.textInput}
                placeholder={t("chat.placeholder")}
                placeholderTextColor={colors.dark500}
                value={inputText}
                onChangeText={setInputText}
                multiline
                textAlignVertical="top"
              />
            </View>

            {/* Send Button */}
            <Pressable
              style={[
                styles.sendButton,
                (inputText.trim() || selectedFiles.length > 0) && !isLoading ? styles.sendButtonActive : styles.sendButtonInactive
              ]}
              onPress={handleSend}
              disabled={(!inputText.trim() && selectedFiles.length === 0) || isLoading}
            >
              <Text style={styles.buttonEmoji}>➤</Text>
            </Pressable>
          </View>

          {/* Disclaimer */}
          <Text style={styles.disclaimer}>
            {t("legal.disclaimerShort")}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark900,
  },
  flex1: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark700,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: colors.dark400,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 768,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    backgroundColor: colors.dark800,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: colors.dark400,
    textAlign: "center",
    marginBottom: 16,
  },
  emptyDisclaimer: {
    color: colors.dark500,
    fontSize: 12,
    textAlign: "center",
    paddingHorizontal: 32,
  },
  messagesContainer: {
    flex: 1,
    alignItems: "center",
  },
  messagesList: {
    padding: 16,
    paddingBottom: 8,
    width: "100%",
    maxWidth: 768,
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.dark700,
    backgroundColor: colors.dark800,
    padding: 16,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  selectedFilesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  fileChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary600,
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    maxWidth: "90%",
  },
  fileChipText: {
    color: colors.white,
    fontSize: 13,
    marginRight: 8,
    flex: 1,
  },
  fileRemoveButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  fileRemoveText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
  },
  attachButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.dark700,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  textInputWrapper: {
    flex: 1,
  },
  textInput: {
    backgroundColor: colors.dark700,
    color: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    maxHeight: 128,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: colors.primary600,
  },
  sendButtonInactive: {
    backgroundColor: colors.dark700,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  disclaimer: {
    color: colors.dark500,
    fontSize: 12,
    textAlign: "center",
    marginTop: 12,
  },
});
