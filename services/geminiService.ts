
import { GoogleGenAI, Chat } from "@google/genai";
import { MOCK_PRODUCTS, STORE_NAME, CONTACT_PHONE } from '../constants';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction context containing product catalog
const productContext = MOCK_PRODUCTS.map(p => 
  `- ${p.name} (${p.category}): ${p.price.toLocaleString('vi-VN')} VND. Specs: ${p.specs.join(', ')}`
).join('\n');

const systemInstruction = `
Bạn là trợ lý ảo chuyên nghiệp của '${STORE_NAME}'.
Số điện thoại liên hệ của cửa hàng là: ${CONTACT_PHONE}.
Nhiệm vụ của bạn là tư vấn cho khách hàng về các thiết bị CNTT (Máy chủ Server, NAS, Workstation, Network, Mực in/Máy in).
Phong cách trả lời: Chuyên nghiệp, kỹ thuật chính xác, ngắn gọn, lịch sự và thân thiện.

Dưới đây là danh sách sản phẩm tiêu biểu:
${productContext}

Nguyên tắc tư vấn:
1. Nếu khách hỏi giá, hãy báo giá chính xác từ danh sách hoặc báo giá theo khoảng giá nếu không có model chính xác.
2. Nếu khách hỏi kỹ thuật sâu (RAID, ảo hóa, network topology), hãy tư vấn dựa trên kiến thức chuyên môn và luôn gợi ý khách hàng gọi hotline ${CONTACT_PHONE} để được chuyên gia tư vấn chi tiết hơn.
3. Ưu tiên giải pháp tối ưu cho doanh nghiệp.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  try {
    const chat = getChatSession();
    const result = await chat.sendMessage({ message });
    return result.text || "Xin lỗi, tôi chưa hiểu rõ câu hỏi. Vui lòng thử lại hoặc liên hệ hotline để được hỗ trợ trực tiếp.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Hệ thống tư vấn đang bận. Vui lòng liên hệ hotline " + CONTACT_PHONE + " để được phản hồi nhanh nhất.";
  }
};
