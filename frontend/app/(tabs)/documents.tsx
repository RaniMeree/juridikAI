import { View, Text, Pressable, FlatList, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { useTranslation } from "@/hooks/useTranslation";
import { useDocumentStore, UserDocument } from "@/store/documentStore";

// Theme colors
const colors = {
  primary600: "#4F46E5",
  primary700: "#4338CA",
  dark400: "#94A3B8",
  dark500: "#64748B",
  dark700: "#334155",
  dark800: "#1E293B",
  dark900: "#0F172A",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  white: "#FFFFFF",
};

export default function DocumentsScreen() {
  const { t } = useTranslation();
  const { documents, uploadDocument, deleteDocument, isUploading } = useDocumentStore();

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = result.assets[0];
      
      // Check file size (10MB limit)
      if (file.size && file.size > 10 * 1024 * 1024) {
        Alert.alert(t("common.error"), t("chat.errors.fileTooLarge"));
        return;
      }

      await uploadDocument(file);
    } catch (error) {
      Alert.alert(t("common.error"), t("chat.errors.uploadFailed"));
    }
  };

  const handleDelete = (doc: UserDocument) => {
    Alert.alert(
      t("documents.delete"),
      t("documents.deleteConfirm"),
      [
        { text: t("common.cancel"), style: "cancel" },
        { 
          text: t("common.delete"), 
          style: "destructive", 
          onPress: () => deleteDocument(doc.id) 
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready": return colors.success;
      case "processing": return colors.warning;
      case "failed": return colors.error;
      default: return colors.dark500;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "ready": return t("documents.ready");
      case "processing": return t("documents.processing");
      case "failed": return t("documents.failed");
      default: return status;
    }
  };

  const renderDocument = ({ item }: { item: UserDocument }) => (
    <Pressable
      style={styles.documentCard}
      onLongPress={() => handleDelete(item)}
    >
      {/* File Icon */}
      <View style={styles.fileIcon}>
        <Text style={styles.fileEmoji}>
          {item.fileType === "pdf" ? "📕" : "📘"}
        </Text>
      </View>

      {/* File Info */}
      <View style={styles.fileInfo}>
        <Text style={styles.fileName} numberOfLines={1}>
          {item.fileName}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
          {item.pageCount && (
            <Text style={styles.pageCount}>
              • {item.pageCount} pages
            </Text>
          )}
        </View>
      </View>

      {/* Delete Button */}
      <Pressable
        style={styles.deleteButton}
        onPress={() => handleDelete(item)}
      >
        <Text style={styles.deleteEmoji}>🗑️</Text>
      </Pressable>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("documents.title")}</Text>
        <Pressable
          style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
          onPress={handleUpload}
          disabled={isUploading}
        >
          <Text style={styles.uploadButtonText}>
            {isUploading ? t("chat.uploadingFile") : t("documents.upload")}
          </Text>
        </Pressable>
      </View>

      {/* Documents List */}
      {documents.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Text style={styles.emptyEmoji}>📄</Text>
          </View>
          <Text style={styles.emptyTitle}>
            {t("documents.noDocuments")}
          </Text>
          <Text style={styles.emptySubtitle}>
            {t("documents.uploadFirst")}
          </Text>
          <Text style={styles.emptyHint}>
            {t("documents.supportedFormats")}
          </Text>
          <Text style={styles.emptyHint}>
            {t("documents.maxSize")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          keyExtractor={(item) => item.id}
          renderItem={renderDocument}
          contentContainerStyle={styles.documentsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark900,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark700,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  uploadButton: {
    backgroundColor: colors.primary600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  uploadButtonDisabled: {
    backgroundColor: colors.dark700,
  },
  uploadButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  documentsList: {
    padding: 16,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  documentCard: {
    backgroundColor: colors.dark800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark700,
    flexDirection: "row",
    alignItems: "center",
  },
  fileIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.dark700,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  fileEmoji: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: colors.white,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: colors.dark400,
    fontSize: 14,
  },
  pageCount: {
    color: colors.dark500,
    fontSize: 14,
    marginLeft: 8,
  },
  deleteButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteEmoji: {
    color: colors.dark500,
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
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
    marginBottom: 24,
  },
  emptyHint: {
    color: colors.dark500,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
});
