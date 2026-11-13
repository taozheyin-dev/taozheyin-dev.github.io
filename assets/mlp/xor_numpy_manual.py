"""Pure NumPy implementation of the 2-2-1 MLP on XOR with explicit backpropagation & Adam."""

import numpy as np


def sigmoid(z: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-np.clip(z, -60.0, 60.0)))


def bce_with_logits(logits: np.ndarray, targets: np.ndarray) -> float:
    # 数值稳定形式：max(logits, 0) - logits * targets + log(1 + exp(-|logits|))
    return float(
        np.mean(np.maximum(logits, 0.0) - logits * targets + np.log1p(np.exp(-np.abs(logits))))
    )


def main() -> None:
    # ① 张量
    x = np.array([[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]], dtype=np.float64)
    target = np.array([[0.0], [1.0], [1.0], [0.0]], dtype=np.float64)
    n_samples = x.shape[0]

    # ② 模型参数
    params = {
        "W": np.array([[2.0, -2.0], [-2.0, 2.0]], dtype=np.float64),
        "b_hidden": np.array([-1.0, -1.0], dtype=np.float64),
        "v": np.array([[3.0], [3.0]], dtype=np.float64),
        "b_output": np.array([-2.5], dtype=np.float64),
    }

    # Adam 优化器超参数与一阶/二阶矩状态
    lr, beta1, beta2, eps = 0.03, 0.9, 0.999, 1e-8
    m = {k: np.zeros_like(val) for k, val in params.items()}
    s = {k: np.zeros_like(val) for k, val in params.items()}

    for epoch in range(1, 301):
        # 前向传播
        z_hidden = x @ params["W"] + params["b_hidden"]
        hidden = sigmoid(z_hidden)
        logits = hidden @ params["v"] + params["b_output"]
        prob = sigmoid(logits)

        # ③ 损失
        loss = bce_with_logits(logits, target)

        # ④ 手写反向传播（链式法则）
        d_logits = (prob - target) / n_samples
        grad_v = hidden.T @ d_logits
        grad_b_output = np.sum(d_logits, axis=0)
        d_hidden = d_logits @ params["v"].T
        d_z_hidden = d_hidden * hidden * (1.0 - hidden)
        grad_W = x.T @ d_z_hidden
        grad_b_hidden = np.sum(d_z_hidden, axis=0)

        grads = {
            "W": grad_W,
            "b_hidden": grad_b_hidden,
            "v": grad_v,
            "b_output": grad_b_output,
        }

        # ⑤ Adam 参数更新
        for name, param in params.items():
            g = grads[name]
            m[name] = beta1 * m[name] + (1.0 - beta1) * g
            s[name] = beta2 * s[name] + (1.0 - beta2) * (g * g)
            m_hat = m[name] / (1.0 - beta1**epoch)
            s_hat = s[name] / (1.0 - beta2**epoch)
            param -= lr * m_hat / (np.sqrt(s_hat) + eps)

        if epoch in {1, 50, 100, 200, 300}:
            p_now = sigmoid(sigmoid(x @ params["W"] + params["b_hidden"]) @ params["v"] + params["b_output"])
            print(
                f"epoch={epoch:3d} | loss={loss:.6f} | "
                f"probs={[round(float(val), 4) for val in p_now.ravel()]}"
            )

    print("\n--- Final Learned Parameters (NumPy Manual Backprop) ---")
    for k, val in params.items():
        print(f"{k} = {val.tolist()}")


if __name__ == "__main__":
    main()
