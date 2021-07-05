require("dotenv").config();
const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;

const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

exports.handler = async function (event, context) {
  const docId = event.queryStringParameters.id;
  try {
    const { data, error } = await supabase
      .from("documents")
      .select("content")
      .eq("id", docId);
    if (error) throw error;

    if (!data.length) {
      return {
        statusCode: 404,
        body: "Not found",
      };
    }

    return {
      statusCode: 200,
      body: data[0].content,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
