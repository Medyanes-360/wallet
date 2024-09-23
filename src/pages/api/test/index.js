import {
  createNewData,
  deleteDataAll,
  deleteDataByAny,
  getAllData,
  updateDataByAny,
} from "../../../services/serviceOperations";

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const data = await getAllData("TodoItem");

      if (!data || data.error || data === undefined) {
        throw new Error(data.error);
      }

      return res.status(200).json({ status: "success", data: data });
    } catch (error) {
      return res
        .status(500)
        .json({ status: "error", error: error.message, data: null });
    }
  } else if (req.method === "POST") {
    try {
      const body = await req.body;

      const data = await createNewData("TestVal", body);

      if (!data || data.error) {
        throw new Error(data.error);
      }
      return res
        .status(200)
        .json({ status: "success", message: "api isteği başarılı" });
    } catch (error) {
      return res.status(500).json({ status: "error", error: error.message });
    }
  } else if (req.method === "PUT") {
    try {
      const { where, data } = await req.body;

      const result = await updateDataByAny("TodoItem", where, data);

      if (!result || result.error) {
        throw new Error(result.error);
      }
      return res
        .status(200)
        .json({ status: "success", message: "api isteği başarılı" });
    } catch (error) {
      return res.status(500).json({ status: "error", error: error.message });
    }
  } else if (req.method === "DELETE") {
    try {
      const body = await req.body;

      const data = body
        ? await deleteDataByAny("TodoItem", body)
        : await deleteDataAll("TodoItem");

      if (!data || data.error) {
        throw new Error(data.error);
      }
      return res
        .status(200)
        .json({ status: "success", message: "api isteği başarılı" });
    } catch (error) {
      return res.status(500).json({ status: "error", error: error.message });
    }
  }
};

export default handler;
