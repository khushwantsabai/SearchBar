import { redirect, Form, useActionData, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    return redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export const action = async ({ request }) => {
  try {
    const errors = loginErrorMessage(await login(request));
    return { errors };
  } catch (err) {
    return { errors: { shop: "Failed to initiate login. Please check shop domain." } };
  }
};

export default function App() {
  const { showForm } = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors;

  return (
    <div className={styles.index}>
      <div className={styles.content}>
        <h1 className={styles.heading}>SearchBar for Shopify</h1>
        <p className={styles.text}>
          Create beautiful, responsive, customizable search bars for your Shopify storefront with zero code.
        </p>
        {showForm && (
          <Form className={styles.form} method="post">
            <label className={styles.label}>
              <span>Enter your Shopify store domain</span>
              <input
                className={styles.input}
                type="text"
                name="shop"
                placeholder="your-store.myshopify.com"
              />
              <span style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                {errors?.shop ?? "e.g: my-shop-domain.myshopify.com"}
              </span>
            </label>
            <button className={styles.button} type="submit">
              Log in to store
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}
