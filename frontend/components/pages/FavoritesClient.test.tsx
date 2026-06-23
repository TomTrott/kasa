import { render, screen, waitFor } from "@testing-library/react";
import FavoritesClient from "./FavoritesClient";
import api from "@/services/api";

jest.mock("@/services/api");

jest.mock("@/components/Property/PropertyCard", () => {
  return function MockPropertyCard({
    property,
  }: {
    property: { title: string };
  }) {
    return <div>{property.title}</div>;
  };
});

const mockedApi = api as jest.Mocked<typeof api>;

describe("FavoritesClient", () => {
  beforeEach(() => {
    localStorage.setItem(
      "user",
      JSON.stringify({ id: 1 })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("affiche les favoris", async () => {
    mockedApi.get.mockResolvedValue({
      data: [
        {
          id: 1,
          title: "Villa Luxe",
        },
      ],
    } as any);

    render(<FavoritesClient />);

    expect(
      screen.getByText("Chargement...")
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Villa Luxe")
      ).toBeInTheDocument();
    });
  });

  it("affiche aucun favori", async () => {
    mockedApi.get.mockResolvedValue({
      data: [],
    } as any);

    render(<FavoritesClient />);

    await waitFor(() => {
      expect(
        screen.getByText("Aucun favori")
      ).toBeInTheDocument();
    });
  });

  it("recharge lors de l'événement favorites-changed", async () => {
    mockedApi.get
      .mockResolvedValueOnce({
        data: [],
      } as any)
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            title: "Maison Test",
          },
        ],
      } as any);

    render(<FavoritesClient />);

    await waitFor(() => {
      expect(
        screen.getByText("Aucun favori")
      ).toBeInTheDocument();
    });

    window.dispatchEvent(
      new Event("favorites-changed")
    );

    await waitFor(() => {
      expect(
        screen.getByText("Maison Test")
      ).toBeInTheDocument();
    });
  });
});