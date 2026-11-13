"""Train a 2-2-1 sigmoid MLP on XOR using PyTorch autograd + Adam."""

import torch
import torch.nn.functional as F


def main() -> None:
    torch.manual_seed(7)
    torch.set_default_dtype(torch.float64)

    # ① 张量：x 的四行依次是 00、01、10、11；target 为对应的 XOR 标签。
    x = torch.tensor(
        [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]],
        dtype=torch.float64,
    )
    target = torch.tensor([[0.0], [1.0], [1.0], [0.0]], dtype=torch.float64)

    # ② 模型：2 输入 -> 2 隐藏 (sigmoid) -> 1 输出
    W = torch.nn.Parameter(torch.tensor([[2.0, -2.0], [-2.0, 2.0]]))
    b_hidden = torch.nn.Parameter(torch.tensor([-1.0, -1.0]))
    v = torch.nn.Parameter(torch.tensor([[3.0], [3.0]]))
    b_output = torch.nn.Parameter(torch.tensor([-2.5]))

    parameters = [W, b_hidden, v, b_output]
    optimizer = torch.optim.Adam(parameters, lr=0.03)

    checkpoints = {1, 50, 100, 200, 300}
    for epoch in range(1, 301):
        optimizer.zero_grad(set_to_none=True)
        hidden = torch.sigmoid(x @ W + b_hidden)
        logits = hidden @ v + b_output
        # ③ 损失：二元交叉熵（带 logits 数值稳定实现）
        loss = F.binary_cross_entropy_with_logits(logits, target)
        # ④ 自动求梯度：反向传播计算各参数梯度
        loss.backward()
        # ⑤ 更新参数：Adam 依据梯度更新参数
        optimizer.step()

        if epoch in checkpoints:
            with torch.no_grad():
                probs = torch.sigmoid(torch.sigmoid(x @ W + b_hidden) @ v + b_output)
                acc = ((probs >= 0.5).to(torch.int64) == target.to(torch.int64)).float().mean().item()
                print(
                    f"epoch={epoch:3d} | loss={loss.item():.6f} | acc={acc * 100:5.1f}% | "
                    f"probs={[round(p, 4) for p in probs.flatten().tolist()]}"
                )

    with torch.no_grad():
        hidden = torch.sigmoid(x @ W + b_hidden)
        final_logits = hidden @ v + b_output
        final_loss = F.binary_cross_entropy_with_logits(final_logits, target)
        probabilities = torch.sigmoid(final_logits)
        predictions = (probabilities >= 0.5).to(torch.int64)
        correct = torch.all(predictions == target.to(torch.int64)).item()

    print("\n--- Final Learned Parameters (PyTorch) ---")
    print("W =\n", W.detach().numpy())
    print("b_hidden =", b_hidden.detach().numpy())
    print("v =", v.detach().numpy().ravel())
    print("b_output =", b_output.detach().numpy())
    print(f"\nfinal_loss={final_loss.item():.6f}")
    print("x1 x2 | target | hidden (h1, h2) | probability | predicted")
    for sample, label, hidden_row, probability, prediction in zip(
        x, target, hidden, probabilities, predictions
    ):
        print(
            f"{int(sample[0].item())}  {int(sample[1].item())}  |"
            f"   {int(label[0].item())}    |"
            f"    ({hidden_row[0].item():.4f}, {hidden_row[1].item():.4f})    |"
            f"   {probability[0].item():.4f}    |     {prediction[0].item()}"
        )

    if not correct:
        raise SystemExit("XOR was not fully classified.")
    print("All four XOR samples classified correctly.")


if __name__ == "__main__":
    main()
