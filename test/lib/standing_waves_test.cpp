#include <gtest/gtest.h>
#include <Eigen/Dense>
#include <cmath>

#include "../../src/lib/standing_waves.h"
#include "../../src/lib/matching_pursuit.h"

TEST(Laplacian, Hex) {
  standing_waves::SparseMatrix result = standing_waves::hex_laplacian(1,3,2);

  Eigen::Matrix<double, 6, 6> expected_dense;
  expected_dense << 2, -1, -1, 0, 0, 0,
                    -1, 4, -1, -1, -1, 0,
                    -1, -1, 3, 0, -1, 0,
                    0, -1, 0, 3, -1, -1,
                    0, -1, -1, -1, 4, -1,
                    0, 0, 0, -1, -1, 2;

  ASSERT_TRUE(result.isApprox(expected_dense.sparseView()));
}

TEST(Laplacian, Rect) {
  standing_waves::SparseMatrix result = standing_waves::rect_laplacian(3, 3);
  Eigen::Matrix<double, 9, 9> expected_dense;
  expected_dense <<
      2, -1, 0, -1, 0, 0, 0, 0, 0,
     -1, 3, -1, 0, -1, 0, 0, 0, 0,
      0, -1, 2, 0, 0, -1, 0, 0, 0,
     -1, 0, 0, 3, -1, 0, -1, 0, 0,
      0, -1, 0, -1, 4, -1, 0, -1, 0,
      0, 0, -1, 0, -1, 3, 0, 0, -1,
      0, 0, 0, -1, 0, 0, 2, -1, 0,
      0, 0, 0, 0, -1, 0, -1, 3, -1,
      0, 0, 0, 0, 0, -1, 0, -1, 2;

  ASSERT_TRUE(result.isApprox(expected_dense.sparseView()));
}

// TODO: RapidCheck
TEST(OrthogonalMatchingPursuitTest, BasicTest) {
  Eigen::MatrixXd X(3, 5);
  X << 76, 67, 6, 15, 42,
       21, 9, 72, 96, 28,
       28, 95, 63, 97, 21;

  Eigen::VectorXd y(3);
  y << 298,
       228,
       574;

  Eigen::VectorXd expected_theta(5);
  expected_theta << 0, 4, 0, 2, 0;

  Eigen::VectorXd theta = omp(X, y, 2);
  Eigen::VectorXd result = X * theta;
  for (int i = 0; i < y.size(); ++i) {
    EXPECT_NEAR(result(i), y(i), 1e-5);
  }
  for (int i = 0; i < theta.size(); ++i) {
    EXPECT_NEAR(theta(i), expected_theta(i), 1e-5);
  }
}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}
