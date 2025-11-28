import { createBrowserRouter, Navigate } from "react-router-dom";
import { VocabListPage } from "../features/vocab/pages/VocabListPage";
// import { DeckListPage } from "../features/decks/pages/DeckListPage";
// import { DeckDetailPage } from "../features/decks/pages/DeckDetailPage";
import { Layout } from "../components/Layout";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { ReviewQueuePage } from "@/features/review/pages/ReviewQueuePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/vocabs" replace />,
      },
      // {
      //   path: "decks",
      //   element: <DeckListPage />,
      // },
      // {
      //   path: "decks/:slug",
      //   element: <DeckDetailPage />,
      // },
      // {
      //   path: "decks/preview",
      //   element: <DeckDetailPage />,
      // },
      {
        path: "vocabs",
        element: (
          <ProtectedRoute>
            <VocabListPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "review",
        element: (
          <ProtectedRoute>
            <ReviewQueuePage />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
