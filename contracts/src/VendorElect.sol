// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, ebool, euint8, externalEuint8 } from "@fhevm/solidity/lib/FHE.sol";
import { ZamaEthereumConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title VendorElect
 * @notice FHE-encrypted vendor potential rating system
 * @dev User submits 6 encrypted indicators, contract calculates overall grade in ciphertext
 * 
 * Indicator encoding:
 *   - First 5 indicators (capital/years/employees/tax/revenue): 0=A, 1=B, 2=C
 *   - Lawsuit record: 0=None, 1=Has
 * 
 * Grading rules:
 *   - Grade A: ≥4 items at A level, and no lawsuit
 *   - Grade B: ≥4 items at B or above, and no lawsuit
 *   - Grade C: Otherwise
 */
contract VendorElect is ZamaEthereumConfig {
    
    // ==================== Structs ====================
    
    struct Rating {
        euint8 capital;       // Registered capital grade (0=A, 1=B, 2=C)
        euint8 yearsFounded;  // Years in business grade
        euint8 employees;     // Employee count grade
        euint8 tax;           // Annual tax payment grade
        euint8 revenue;       // Annual revenue grade
        euint8 lawsuit;       // Lawsuit record (0=None, 1=Has)
        euint8 overallGrade;  // Overall grade (0=A, 1=B, 2=C)
        uint256 timestamp;    // Rating timestamp
    }
    
    // ==================== State Variables ====================
    
    mapping(address => Rating) private ratings;
    mapping(address => uint256) public ratingCount;
    
    // ==================== Events ====================
    
    event RatingCompleted(address indexed user, uint256 timestamp);
    
    // ==================== Constructor ====================
    
    constructor() {}
    
    // ==================== Main Functions ====================
    
    /**
     * @notice Submit encrypted rating indicators and calculate grade in one transaction
     * @param encCapital Encrypted registered capital grade
     * @param encYearsFounded Encrypted years in business grade
     * @param encEmployees Encrypted employee count grade
     * @param encTax Encrypted annual tax payment grade
     * @param encRevenue Encrypted annual revenue grade
     * @param encLawsuit Encrypted lawsuit record
     * @param inputProof Encryption proof
     */
    function submitAndCalculate(
        externalEuint8 encCapital,
        externalEuint8 encYearsFounded,
        externalEuint8 encEmployees,
        externalEuint8 encTax,
        externalEuint8 encRevenue,
        externalEuint8 encLawsuit,
        bytes calldata inputProof
    ) external {
        // Convert external encrypted inputs to internal types
        euint8 capital = FHE.fromExternal(encCapital, inputProof);
        euint8 yearsFounded = FHE.fromExternal(encYearsFounded, inputProof);
        euint8 employees = FHE.fromExternal(encEmployees, inputProof);
        euint8 tax = FHE.fromExternal(encTax, inputProof);
        euint8 revenue = FHE.fromExternal(encRevenue, inputProof);
        euint8 lawsuit = FHE.fromExternal(encLawsuit, inputProof);
        
        // Store rating data
        Rating storage r = ratings[msg.sender];
        r.capital = capital;
        r.yearsFounded = yearsFounded;
        r.employees = employees;
        r.tax = tax;
        r.revenue = revenue;
        r.lawsuit = lawsuit;
        r.timestamp = block.timestamp;
        
        // Grant access to contract
        FHE.allowThis(r.capital);
        FHE.allowThis(r.yearsFounded);
        FHE.allowThis(r.employees);
        FHE.allowThis(r.tax);
        FHE.allowThis(r.revenue);
        FHE.allowThis(r.lawsuit);
        
        // Grant access to user
        FHE.allow(r.capital, msg.sender);
        FHE.allow(r.yearsFounded, msg.sender);
        FHE.allow(r.employees, msg.sender);
        FHE.allow(r.tax, msg.sender);
        FHE.allow(r.revenue, msg.sender);
        FHE.allow(r.lawsuit, msg.sender);
        
        // ==================== Calculate Grade ====================
        
        euint8 zero = FHE.asEuint8(0);
        euint8 one = FHE.asEuint8(1);
        euint8 two = FHE.asEuint8(2);
        
        // Count A-level items (value == 0)
        ebool isCapitalA = FHE.eq(capital, zero);
        ebool isYearsA = FHE.eq(yearsFounded, zero);
        ebool isEmployeesA = FHE.eq(employees, zero);
        ebool isTaxA = FHE.eq(tax, zero);
        ebool isRevenueA = FHE.eq(revenue, zero);
        
        // Convert ebool to euint8 and sum
        euint8 countA = FHE.add(
            FHE.add(
                FHE.add(
                    FHE.select(isCapitalA, one, zero),
                    FHE.select(isYearsA, one, zero)
                ),
                FHE.add(
                    FHE.select(isEmployeesA, one, zero),
                    FHE.select(isTaxA, one, zero)
                )
            ),
            FHE.select(isRevenueA, one, zero)
        );
        
        // Count B-or-above items (value <= 1)
        ebool isCapitalBOrAbove = FHE.le(capital, one);
        ebool isYearsBOrAbove = FHE.le(yearsFounded, one);
        ebool isEmployeesBOrAbove = FHE.le(employees, one);
        ebool isTaxBOrAbove = FHE.le(tax, one);
        ebool isRevenueBOrAbove = FHE.le(revenue, one);
        
        euint8 countBOrAbove = FHE.add(
            FHE.add(
                FHE.add(
                    FHE.select(isCapitalBOrAbove, one, zero),
                    FHE.select(isYearsBOrAbove, one, zero)
                ),
                FHE.add(
                    FHE.select(isEmployeesBOrAbove, one, zero),
                    FHE.select(isTaxBOrAbove, one, zero)
                )
            ),
            FHE.select(isRevenueBOrAbove, one, zero)
        );
        
        // Calculate overall grade
        euint8 four = FHE.asEuint8(4);
        
        // Condition A: ≥4 A-level items AND no lawsuit → Grade A
        ebool conditionA = FHE.and(FHE.ge(countA, four), FHE.eq(lawsuit, zero));
        
        // Condition B: ≥4 B-or-above items AND no lawsuit → Grade B
        ebool conditionB = FHE.and(FHE.ge(countBOrAbove, four), FHE.eq(lawsuit, zero));
        
        // Final grade: A=0, B=1, C=2
        euint8 gradeIfNotA = FHE.select(conditionB, one, two);
        euint8 finalGrade = FHE.select(conditionA, zero, gradeIfNotA);
        
        r.overallGrade = finalGrade;
        
        // Grant access to overall grade
        FHE.allowThis(r.overallGrade);
        FHE.allow(r.overallGrade, msg.sender);
        
        ratingCount[msg.sender]++;
        
        emit RatingCompleted(msg.sender, block.timestamp);
    }
    
    // ==================== View Functions ====================
    
    /**
     * @notice Get user's encrypted item grades
     */
    function getItemGrades() external view returns (
        euint8 capital,
        euint8 yearsFounded,
        euint8 employees,
        euint8 tax,
        euint8 revenue,
        euint8 lawsuit
    ) {
        Rating storage r = ratings[msg.sender];
        return (r.capital, r.yearsFounded, r.employees, r.tax, r.revenue, r.lawsuit);
    }
    
    /**
     * @notice Get user's encrypted overall grade
     */
    function getOverallGrade() external view returns (euint8 grade) {
        Rating storage r = ratings[msg.sender];
        require(r.timestamp > 0, "No rating submitted");
        return r.overallGrade;
    }
    
    /**
     * @notice Get rating timestamp
     */
    function getRatingTimestamp() external view returns (uint256) {
        return ratings[msg.sender].timestamp;
    }
    
    /**
     * @notice Check if user has a rating
     */
    function hasRating() external view returns (bool) {
        return ratings[msg.sender].timestamp > 0;
    }
}
