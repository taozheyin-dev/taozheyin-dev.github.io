"""Train a 2-2-1 sigmoid MLP on XOR using TensorFlow GradientTape + Adam."""

import os

os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")

import tensorflow as tf


def main() -> None:
    tf.keras.utils.set_random_seed(7)
    tf.keras.backend.set_floatx("float64")

    # ① 张量：x 的四行依次是 00、01、10、11；target 为对应的 XOR 标签。
    x = tf.constant(
        [[0.0, 0.0], [0.0, 1.0], [1.0, 0.0], [1.0, 1.0]],
        dtype=tf.float64,
    )
    target = tf.constant([[0.0], [1.0], [1.0], [0.0]], dtype=tf.float64)

    # ② 模型：2 输入 -> 2 隐藏 (sigmoid) -> 1 输出
    W = tf.Variable([[2.0, -2.0], [-2.0, 2.0]], dtype=tf.float64)
    b_hidden = tf.Variable([-1.0, -1.0], dtype=tf.float64)
    v = tf.Variable([[3.0], [3.0]], dtype=tf.float64)
    b_output = tf.Variable([-2.5], dtype=tf.float64)

    parameters = [W, b_hidden, v, b_output]
    optimizer = tf.keras.optimizers.Adam(learning_rate=0.03)

    checkpoints = {1, 50, 100, 200, 300}
    for epoch in range(1, 301):
        with tf.GradientTape() as tape:
            hidden = tf.sigmoid(tf.matmul(x, W) + b_hidden)
            logits = tf.matmul(hidden, v) + b_output
            # ③ 损失：二元交叉熵（带 logits 数值稳定实现）
            loss = tf.reduce_mean(
                tf.nn.sigmoid_cross_entropy_with_logits(
                    labels=target,
                    logits=logits,
                )
            )

        # ④ 自动求梯度：tape 记录前向计算图并按链式法则求偏导
        gradients = tape.gradient(loss, parameters)
        # ⑤ 更新参数：Adam 依据梯度更新权重与偏置
        optimizer.apply_gradients(zip(gradients, parameters))

        if epoch in checkpoints:
            probs = tf.sigmoid(tf.matmul(tf.sigmoid(tf.matmul(x, W) + b_hidden), v) + b_output)
            preds = tf.cast(probs >= 0.5, tf.int32)
            acc = tf.reduce_mean(tf.cast(preds == tf.cast(target, tf.int32), tf.float64)).numpy()
            print(
                f"epoch={epoch:3d} | loss={loss.numpy():.6f} | acc={acc * 100:5.1f}% | "
                f"probs={[round(float(p), 4) for p in probs.numpy().ravel()]}"
            )

    hidden = tf.sigmoid(tf.matmul(x, W) + b_hidden)
    final_logits = tf.matmul(hidden, v) + b_output
    final_loss = tf.reduce_mean(
        tf.nn.sigmoid_cross_entropy_with_logits(labels=target, logits=final_logits)
    )
    probabilities = tf.sigmoid(final_logits)
    predictions = tf.cast(probabilities >= 0.5, tf.int32)
    correct = tf.reduce_all(predictions == tf.cast(target, tf.int32))

    print("\n--- Final Learned Parameters (TensorFlow) ---")
    print("W =\n", W.numpy())
    print("b_hidden =", b_hidden.numpy())
    print("v =", v.numpy().ravel())
    print("b_output =", b_output.numpy())
    print(f"\nfinal_loss={final_loss.numpy():.6f}")
    print("x1 x2 | target | hidden (h1, h2) | probability | predicted")
    for sample, label, hidden_row, probability, prediction in zip(
        x.numpy(), target.numpy(), hidden.numpy(), probabilities.numpy(), predictions.numpy()
    ):
        print(
            f"{int(sample[0])}  {int(sample[1])}  |   {int(label[0])}    |"
            f"    ({hidden_row[0]:.4f}, {hidden_row[1]:.4f})    |"
            f"   {probability[0]:.4f}    |     {prediction[0]}"
        )

    if not bool(correct.numpy()):
        raise SystemExit("XOR was not fully classified.")
    print("All four XOR samples classified correctly.")


if __name__ == "__main__":
    main()
