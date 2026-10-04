"""Exercise real assessment handlers against an isolated store (no production writes)."""
import ast
import sqlite3
import unittest
from pathlib import Path
from flask import Flask, request, jsonify

class ComponentPersistenceTests(unittest.TestCase):
    def test_independent_roundtrip_and_validation(self):
        db=sqlite3.connect(':memory:')
        db.row_factory=sqlite3.Row
        db.execute('CREATE TABLE vessel_tank_assessment (vessel_id TEXT,tank_id TEXT,steel_none INTEGER,inspection_pending INTEGER,updated_at TEXT,PRIMARY KEY(vessel_id,tank_id))')
        app=Flask(__name__)
        tree=ast.parse(Path('app.py').read_text())
        functions=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name in ('save_tank_assessment','get_tank_assessments')]
        for n in functions: n.decorator_list=[]
        ns={'request':request,'jsonify':jsonify,'get_db':lambda:db}
        exec(compile(ast.Module(body=functions,type_ignores=[]),'app.py','exec'),ns)
        for key,flags in [('WBT1P',{'steel_none':True,'inspection_pending':False}),('WBT1P::Wing',{'steel_none':False,'inspection_pending':True}),('WBT1P::DBT',{'steel_none':True,'inspection_pending':False})]:
            with app.test_request_context(json=flags):
                self.assertEqual(ns['save_tank_assessment']('test',key).status_code,200)
        with app.test_request_context():
            data=ns['get_tank_assessments']('test').get_json()
        self.assertTrue(data['WBT1P::Wing']['inspection_pending'])
        self.assertTrue(data['WBT1P::DBT']['steel_none'])
        self.assertTrue(data['WBT1P']['steel_none'])
        for payload in [[],{'steel_none':True,'inspection_pending':True},{'steel_none':1,'inspection_pending':False}]:
            with app.test_request_context(json=payload):
                self.assertEqual(ns['save_tank_assessment']('test','WBT1P::Wing')[1],400)
        db.close()

if __name__=='__main__': unittest.main()
