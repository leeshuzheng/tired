"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, ConfigProvider, Form, Input, InputNumber, Select, message } from "antd";
import type { Event } from "@/types/event";

type CheckoutFormValues = {
  tierId: string;
  name: string;
  email: string;
  phone: string;
  quantity?: number | null;
};

const formTheme = {
  token: {
    colorPrimary: "#EDEFEA",
    colorTextLightSolid: "#2B2E2A",
    colorBgContainer: "transparent",
    colorBorder: "#8A9285",
    colorText: "#EDEFEA",
    colorTextPlaceholder: "#8A9285",
    borderRadius: 0,
    controlHeight: 42,
  },
  components: {
    Form: {
      labelColor: "#8A9285",
      labelFontSize: 12,
    },
  },
};

export default function CheckoutForm({ event }: { event: Event }) {
  const router = useRouter();
  const [form] = Form.useForm<CheckoutFormValues>();
  const [loading, setLoading] = useState(false);

  const tierId = Form.useWatch("tierId", form);
  const quantity = Form.useWatch("quantity", form);
  const selectedTier = event.tiers.find((t) => t.id === tierId);
  const soldOut =
    selectedTier != null &&
    selectedTier.quantitySold >= selectedTier.quantityTotal;

  const onFinish = async function (values: CheckoutFormValues) {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          tierId: values.tierId,
          buyerName: values.name,
          buyerEmail: values.email,
          buyerPhone: values.phone,
          quantity: values.quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        message.error(data.error ?? "Something went wrong");
        return;
      }
      router.replace(data.url);
    } finally {
      setLoading(false);
    }
  }

  
  if (event.tiers.length === 0) {
    return (
      <p className="font-mono text-xs text-[#8A9285]">no tickets available yet</p>
    );
  }

  return (
    <ConfigProvider theme={formTheme}>
      <Form<CheckoutFormValues>
        form={form}
        layout="vertical"
        initialValues={{
          tierId: event.tiers.find((t) => t.quantitySold < t.quantityTotal)?.id
            ?? event.tiers[0]?.id,
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="tierId"
          label="ticket tier"
          rules={[
            { required: true, message: "select a ticket tier" },
            {
              validator: (_, value: string) => {
                const tier = event.tiers.find((t) => t.id === value);
                if (!tier) return Promise.reject(new Error("select a ticket tier"));
                if (tier.quantitySold >= tier.quantityTotal) {
                  return Promise.reject(new Error("this tier is sold out"));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Select
            options={event.tiers.map((t) => ({
              value: t.id,
              label: `${t.name} — $${(t.priceCents / 100).toFixed(2)}${
                t.quantitySold >= t.quantityTotal ? " (sold out)" : ""
              }`,
              disabled: t.quantitySold >= t.quantityTotal,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="full name"
          rules={[{ required: true, message: "enter your name" }]}
        >
          <Input placeholder="full name" />
        </Form.Item>

        <Form.Item
          name="email"
          label="email"
          rules={[
            { required: true, message: "enter your email" },
            { type: "email", message: "enter a valid email" },
          ]}
        >
          <Input placeholder="email" type="email" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="phone"
          rules={[{ required: true, message: "enter your phone number" }]}
        >
          <Input placeholder="phone" />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="quantity"
          rules={[
            { required: true, message: "enter quantity" },
            { type: "number", min: 1, message: "quantity must be at least 1" },
          ]}
        >
          <InputNumber min={1} placeholder="quantity" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={soldOut}
            block
          >
            {soldOut
              ? "sold out"
              : selectedTier && quantity
              ? `pay $${((selectedTier.priceCents * quantity) / 100).toFixed(2)} via paynow`
              : "pay via paynow"}
          </Button>
        </Form.Item>
      </Form>
    </ConfigProvider>
  );
}
