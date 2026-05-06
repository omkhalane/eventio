type JsonResponse = {
  status: (code: number) => {
    json: (body: Record<string, string>) => void;
  };
};

export default function handler(_request: unknown, response: JsonResponse) {
  response.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    brand: "Eventio",
    owner: "Om Khalane",
  });
}
